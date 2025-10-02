const express = require('express');
const pool = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { paginate, buildSearchQuery } = require('../utils/helpers');
const { errorResponse, successResponse } = require('../utils/helpers');

const router = express.Router();

// Get all jobs with pagination and search
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { search, location, remote, fulltime, min_salary, max_salary } = req.query;
    const { offset, limit: queryLimit } = paginate(page, limit);

    let whereConditions = [];
    let params = [];

    // Search functionality
    if (search) {
      const searchQuery = buildSearchQuery(search, ['title', 'company', 'description']);
      whereConditions.push(searchQuery.whereClause);
      params.push(...searchQuery.params);
    }

    // Location filter
    if (location) {
      whereConditions.push('location LIKE ?');
      params.push(`%${location}%`);
    }

    // Remote filter
    if (remote !== undefined) {
      whereConditions.push('is_remote = ?');
      params.push(remote === 'true' ? 1 : 0);
    }

    // Full-time filter
    if (fulltime !== undefined) {
      whereConditions.push('is_fulltime = ?');
      params.push(fulltime === 'true' ? 1 : 0);
    }

    // Salary filters
    if (min_salary) {
      whereConditions.push('salary_max >= ?');
      params.push(parseInt(min_salary));
    }

    if (max_salary) {
      whereConditions.push('salary_min <= ?');
      params.push(parseInt(max_salary));
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get jobs
    const [jobs] = await pool.execute(
      `SELECT id, title, company, location, salary_min, salary_max, tags, 
              description, is_remote, is_fulltime, created_at
       FROM jobs 
       ${whereClause}
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, queryLimit, offset]
    );

    // Get total count for pagination
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM jobs ${whereClause}`,
      params
    );

    return successResponse(res, {
      jobs,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    }, 'Jobs retrieved successfully');

  } catch (error) {
    console.error('Get jobs error:', error);
    return errorResponse(res, 500, 'Failed to retrieve jobs', error.message);
  }
});

// Get job by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const jobId = req.params.id;

    const [jobs] = await pool.execute(
      'SELECT * FROM jobs WHERE id = ?',
      [jobId]
    );

    if (jobs.length === 0) {
      return errorResponse(res, 404, 'Job not found');
    }

    const job = jobs[0];

    // If user is authenticated, check if this job is recommended for them
    let isRecommended = false;
    let recommendationScore = null;
    let recommendationReason = null;

    if (req.user) {
      const [recommendations] = await pool.execute(
        'SELECT score, reason FROM job_recommendations WHERE user_id = ? AND job_id = ?',
        [req.user.id, jobId]
      );

      if (recommendations.length > 0) {
        isRecommended = true;
        recommendationScore = recommendations[0].score;
        recommendationReason = recommendations[0].reason;
      }
    }

    const jobWithRecommendation = {
      ...job,
      isRecommended,
      recommendationScore,
      recommendationReason
    };

    return successResponse(res, jobWithRecommendation, 'Job retrieved successfully');

  } catch (error) {
    console.error('Get job error:', error);
    return errorResponse(res, 500, 'Failed to retrieve job', error.message);
  }
});

// Get user's recommended jobs
router.get('/users/:userId/recommended', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit) || 10;

    // Check if user is getting their own recommendations
    if (userId !== req.user.id) {
      return errorResponse(res, 403, 'You can only view your own job recommendations');
    }

    const [recommendations] = await pool.execute(
      `SELECT jr.score, jr.reason, jr.created_at,
              j.id, j.title, j.company, j.location, j.salary_min, j.salary_max, 
              j.tags, j.description, j.is_remote, j.is_fulltime
       FROM job_recommendations jr
       JOIN jobs j ON jr.job_id = j.id
       WHERE jr.user_id = ?
       ORDER BY jr.score DESC
       LIMIT ?`,
      [userId, limit]
    );

    return successResponse(res, recommendations, 'Job recommendations retrieved successfully');

  } catch (error) {
    console.error('Get job recommendations error:', error);
    return errorResponse(res, 500, 'Failed to retrieve job recommendations', error.message);
  }
});

// Get job categories/companies
router.get('/meta/categories', async (req, res) => {
  try {
    const [companies] = await pool.execute(
      'SELECT DISTINCT company FROM jobs ORDER BY company'
    );

    const [locations] = await pool.execute(
      'SELECT DISTINCT location FROM jobs ORDER BY location'
    );

    // Extract unique tags from all jobs
    const [jobs] = await pool.execute('SELECT tags FROM jobs WHERE tags IS NOT NULL');
    const allTags = new Set();
    
    jobs.forEach(job => {
      if (job.tags) {
        try {
          const tags = JSON.parse(job.tags);
          if (Array.isArray(tags)) {
            tags.forEach(tag => allTags.add(tag));
          }
        } catch (error) {
          console.error('Error parsing tags:', error);
        }
      }
    });

    return successResponse(res, {
      companies: companies.map(c => c.company),
      locations: locations.map(l => l.location),
      tags: Array.from(allTags).sort()
    }, 'Job metadata retrieved successfully');

  } catch (error) {
    console.error('Get job metadata error:', error);
    return errorResponse(res, 500, 'Failed to retrieve job metadata', error.message);
  }
});

// Get similar jobs
router.get('/:id/similar', async (req, res) => {
  try {
    const jobId = req.params.id;
    const limit = parseInt(req.query.limit) || 5;

    // Get the target job
    const [jobs] = await pool.execute(
      'SELECT * FROM jobs WHERE id = ?',
      [jobId]
    );

    if (jobs.length === 0) {
      return errorResponse(res, 404, 'Job not found');
    }

    const targetJob = jobs[0];

    // Find similar jobs based on company, location, and tags
    let similarJobs = [];

    // First, try to find jobs from the same company
    const [sameCompanyJobs] = await pool.execute(
      'SELECT * FROM jobs WHERE company = ? AND id != ? LIMIT ?',
      [targetJob.company, jobId, limit]
    );

    similarJobs = sameCompanyJobs;

    // If we need more jobs, find jobs with similar tags
    if (similarJobs.length < limit && targetJob.tags) {
      try {
        const targetTags = JSON.parse(targetJob.tags);
        if (Array.isArray(targetTags) && targetTags.length > 0) {
          const tagConditions = targetTags.map(() => 'JSON_CONTAINS(tags, ?)').join(' OR ');
          const tagParams = targetTags.map(tag => JSON.stringify(tag));
          
          const [tagSimilarJobs] = await pool.execute(
            `SELECT * FROM jobs WHERE (${tagConditions}) AND id != ? LIMIT ?`,
            [...tagParams, jobId, limit - similarJobs.length]
          );

          similarJobs = [...similarJobs, ...tagSimilarJobs];
        }
      } catch (error) {
        console.error('Error parsing tags for similar jobs:', error);
      }
    }

    // If we still need more jobs, find jobs in the same location
    if (similarJobs.length < limit) {
      const [locationSimilarJobs] = await pool.execute(
        'SELECT * FROM jobs WHERE location = ? AND id != ? AND id NOT IN (?) LIMIT ?',
        [targetJob.location, jobId, similarJobs.map(j => j.id), limit - similarJobs.length]
      );

      similarJobs = [...similarJobs, ...locationSimilarJobs];
    }

    return successResponse(res, similarJobs, 'Similar jobs retrieved successfully');

  } catch (error) {
    console.error('Get similar jobs error:', error);
    return errorResponse(res, 500, 'Failed to retrieve similar jobs', error.message);
  }
});

module.exports = router;
