const express = require('express');
const pool = require('../config/database');
const { optionalAuth } = require('../middleware/auth');
const { buildSearchQuery } = require('../utils/helpers');
const { errorResponse, successResponse } = require('../utils/helpers');

const router = express.Router();

// Global search endpoint
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { q: searchTerm, type, limit = 10 } = req.query;

    if (!searchTerm || searchTerm.trim().length === 0) {
      return errorResponse(res, 400, 'Search term is required');
    }

    const searchResults = {
      jobs: [],
      courses: [],
      community_posts: [],
      users: []
    };

    // Search jobs
    if (!type || type === 'jobs') {
      const jobSearch = buildSearchQuery(searchTerm, ['title', 'company', 'description']);
      const [jobs] = await pool.execute(
        `SELECT id, title, company, location, salary_min, salary_max, tags, description, is_remote, is_fulltime
         FROM jobs 
         ${jobSearch.whereClause}
         ORDER BY 
           CASE 
             WHEN title LIKE ? THEN 1
             WHEN company LIKE ? THEN 2
             WHEN description LIKE ? THEN 3
             ELSE 4
           END
         LIMIT ?`,
        [...jobSearch.params, ...jobSearch.params.slice(0, 3), parseInt(limit)]
      );
      searchResults.jobs = jobs;
    }

    // Search courses (roadmaps)
    if (!type || type === 'courses') {
      const courseSearch = buildSearchQuery(searchTerm, ['title', 'description']);
      const [courses] = await pool.execute(
        `SELECT id, title, description, created_at
         FROM roadmaps 
         ${courseSearch.whereClause}
         ORDER BY 
           CASE 
             WHEN title LIKE ? THEN 1
             WHEN description LIKE ? THEN 2
             ELSE 3
           END
         LIMIT ?`,
        [...courseSearch.params, ...courseSearch.params.slice(0, 2), parseInt(limit)]
      );
      searchResults.courses = courses;
    }

    // Search community posts
    if (!type || type === 'posts') {
      const postSearch = buildSearchQuery(searchTerm, ['content']);
      const [posts] = await pool.execute(
        `SELECT p.id, p.content, p.image_url, p.likes_count, p.created_at,
                u.id as user_id, u.name as user_name, u.avatar_url as user_avatar, u.title as user_title
         FROM community_posts p
         JOIN users u ON p.user_id = u.id
         ${postSearch.whereClause}
         ORDER BY p.created_at DESC
         LIMIT ?`,
        [...postSearch.params, parseInt(limit)]
      );
      searchResults.community_posts = posts;
    }

    // Search users
    if (!type || type === 'users') {
      const userSearch = buildSearchQuery(searchTerm, ['name', 'title']);
      const [users] = await pool.execute(
        `SELECT id, name, avatar_url, title, xp_total, streak_count
         FROM users 
         ${userSearch.whereClause}
         ORDER BY xp_total DESC
         LIMIT ?`,
        [...userSearch.params, parseInt(limit)]
      );
      searchResults.users = users;
    }

    // Calculate total results
    const totalResults = Object.values(searchResults).reduce((sum, results) => sum + results.length, 0);

    return successResponse(res, {
      search_term: searchTerm,
      total_results: totalResults,
      results: searchResults
    }, 'Search completed successfully');

  } catch (error) {
    console.error('Search error:', error);
    return errorResponse(res, 500, 'Search failed', error.message);
  }
});

// Search jobs specifically
router.get('/jobs', optionalAuth, async (req, res) => {
  try {
    const { q: searchTerm, location, remote, fulltime, min_salary, max_salary, limit = 20, page = 1 } = req.query;

    if (!searchTerm || searchTerm.trim().length === 0) {
      return errorResponse(res, 400, 'Search term is required');
    }

    const offset = (page - 1) * limit;
    const searchQuery = buildSearchQuery(searchTerm, ['title', 'company', 'description']);

    let whereConditions = [searchQuery.whereClause];
    let params = [...searchQuery.params];

    // Add additional filters
    if (location) {
      whereConditions.push('location LIKE ?');
      params.push(`%${location}%`);
    }

    if (remote !== undefined) {
      whereConditions.push('is_remote = ?');
      params.push(remote === 'true' ? 1 : 0);
    }

    if (fulltime !== undefined) {
      whereConditions.push('is_fulltime = ?');
      params.push(fulltime === 'true' ? 1 : 0);
    }

    if (min_salary) {
      whereConditions.push('salary_max >= ?');
      params.push(parseInt(min_salary));
    }

    if (max_salary) {
      whereConditions.push('salary_min <= ?');
      params.push(parseInt(max_salary));
    }

    const whereClause = whereConditions.join(' AND ');

    const [jobs] = await pool.execute(
      `SELECT id, title, company, location, salary_min, salary_max, tags, description, is_remote, is_fulltime, created_at
       FROM jobs 
       WHERE ${whereClause}
       ORDER BY 
         CASE 
           WHEN title LIKE ? THEN 1
           WHEN company LIKE ? THEN 2
           WHEN description LIKE ? THEN 3
           ELSE 4
         END,
         created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, ...searchQuery.params.slice(0, 3), parseInt(limit), offset]
    );

    // Get total count for pagination
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM jobs WHERE ${whereClause}`,
      params
    );

    return successResponse(res, {
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    }, 'Job search completed successfully');

  } catch (error) {
    console.error('Job search error:', error);
    return errorResponse(res, 500, 'Job search failed', error.message);
  }
});

// Search community posts specifically
router.get('/posts', optionalAuth, async (req, res) => {
  try {
    const { q: searchTerm, limit = 20, page = 1 } = req.query;

    if (!searchTerm || searchTerm.trim().length === 0) {
      return errorResponse(res, 400, 'Search term is required');
    }

    const offset = (page - 1) * limit;
    const searchQuery = buildSearchQuery(searchTerm, ['content']);

    const [posts] = await pool.execute(
      `SELECT p.id, p.content, p.image_url, p.likes_count, p.created_at,
              u.id as user_id, u.name as user_name, u.avatar_url as user_avatar, u.title as user_title
       FROM community_posts p
       JOIN users u ON p.user_id = u.id
       WHERE ${searchQuery.whereClause}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...searchQuery.params, parseInt(limit), offset]
    );

    // Get total count for pagination
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total 
       FROM community_posts p
       WHERE ${searchQuery.whereClause}`,
      searchQuery.params
    );

    return successResponse(res, {
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    }, 'Post search completed successfully');

  } catch (error) {
    console.error('Post search error:', error);
    return errorResponse(res, 500, 'Post search failed', error.message);
  }
});

// Search users specifically
router.get('/users', optionalAuth, async (req, res) => {
  try {
    const { q: searchTerm, limit = 20, page = 1 } = req.query;

    if (!searchTerm || searchTerm.trim().length === 0) {
      return errorResponse(res, 400, 'Search term is required');
    }

    const offset = (page - 1) * limit;
    const searchQuery = buildSearchQuery(searchTerm, ['name', 'title']);

    const [users] = await pool.execute(
      `SELECT id, name, avatar_url, title, xp_total, streak_count, created_at
       FROM users 
       WHERE ${searchQuery.whereClause}
       ORDER BY xp_total DESC
       LIMIT ? OFFSET ?`,
      [...searchQuery.params, parseInt(limit), offset]
    );

    // Get total count for pagination
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM users WHERE ${searchQuery.whereClause}`,
      searchQuery.params
    );

    return successResponse(res, {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    }, 'User search completed successfully');

  } catch (error) {
    console.error('User search error:', error);
    return errorResponse(res, 500, 'User search failed', error.message);
  }
});

// Get search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q: searchTerm, limit = 5 } = req.query;

    if (!searchTerm || searchTerm.trim().length < 2) {
      return successResponse(res, [], 'No suggestions available');
    }

    const suggestions = [];

    // Get job title suggestions
    const [jobTitles] = await pool.execute(
      'SELECT DISTINCT title FROM jobs WHERE title LIKE ? LIMIT ?',
      [`%${searchTerm}%`, parseInt(limit)]
    );
    suggestions.push(...jobTitles.map(job => ({ type: 'job', text: job.title })));

    // Get company suggestions
    const [companies] = await pool.execute(
      'SELECT DISTINCT company FROM jobs WHERE company LIKE ? LIMIT ?',
      [`%${searchTerm}%`, parseInt(limit)]
    );
    suggestions.push(...companies.map(company => ({ type: 'company', text: company.company })));

    // Get skill suggestions
    const [skills] = await pool.execute(
      'SELECT DISTINCT name FROM skills WHERE name LIKE ? LIMIT ?',
      [`%${searchTerm}%`, parseInt(limit)]
    );
    suggestions.push(...skills.map(skill => ({ type: 'skill', text: skill.name })));

    // Limit total suggestions
    const limitedSuggestions = suggestions.slice(0, parseInt(limit));

    return successResponse(res, limitedSuggestions, 'Search suggestions retrieved successfully');

  } catch (error) {
    console.error('Get search suggestions error:', error);
    return errorResponse(res, 500, 'Failed to get search suggestions', error.message);
  }
});

module.exports = router;
