const express = require('express');
const pool = require('../config/database');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { successResponse, errorResponse, getPaginationParams, getPaginationMeta, buildSearchQuery } = require('../utils/helpers');

const router = express.Router();

// Global search endpoint
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    const { page, limit, offset } = getPaginationParams(req);

    if (!searchTerm || searchTerm.trim().length < 2) {
      return errorResponse(res, 400, 'Search term must be at least 2 characters long');
    }

    const searchResults = {
      jobs: [],
      courses: [],
      posts: [],
      users: []
    };

    // Search jobs
    const jobSearch = buildSearchQuery(searchTerm, ['title', 'company', 'description']);
    const [jobs] = await pool.execute(
      `SELECT id, title, company, location, salary_min, salary_max, tags, description, is_remote, is_fulltime, created_at
       FROM jobs 
       ${jobSearch.query}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...jobSearch.params, limit, offset]
    );

    // Get total jobs count
    const [jobCount] = await pool.execute(
      `SELECT COUNT(*) as total FROM jobs ${jobSearch.query}`,
      jobSearch.params
    );

    searchResults.jobs = {
      data: jobs,
      pagination: getPaginationMeta(page, limit, jobCount[0].total)
    };

    // Search courses
    const courseSearch = buildSearchQuery(searchTerm, ['title', 'description']);
    const [courses] = await pool.execute(
      `SELECT id, title, description, image_url, xp_reward, created_at
       FROM courses 
       ${courseSearch.query}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...courseSearch.params, limit, offset]
    );

    // Get total courses count
    const [courseCount] = await pool.execute(
      `SELECT COUNT(*) as total FROM courses ${courseSearch.query}`,
      courseSearch.params
    );

    searchResults.courses = {
      data: courses,
      pagination: getPaginationMeta(page, limit, courseCount[0].total)
    };

    // Search community posts
    const postSearch = buildSearchQuery(searchTerm, ['content']);
    const [posts] = await pool.execute(
      `SELECT p.id, p.content, p.image_url, p.likes_count, p.created_at, u.name as author_name, u.avatar_url as author_avatar
       FROM community_posts p
       JOIN users u ON p.user_id = u.id
       ${postSearch.query}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...postSearch.params, limit, offset]
    );

    // Get total posts count
    const [postCount] = await pool.execute(
      `SELECT COUNT(*) as total FROM community_posts p ${postSearch.query}`,
      postSearch.params
    );

    searchResults.posts = {
      data: posts,
      pagination: getPaginationMeta(page, limit, postCount[0].total)
    };

    // Search users (only if authenticated)
    if (req.user) {
      const userSearch = buildSearchQuery(searchTerm, ['name', 'title']);
      const [users] = await pool.execute(
        `SELECT id, name, avatar_url, title, xp_total, streak_count
         FROM users 
         ${userSearch.query}
         AND id != ?
         ORDER BY xp_total DESC
         LIMIT ? OFFSET ?`,
        [...userSearch.params, req.user.id, limit, offset]
      );

      // Get total users count
      const [userCount] = await pool.execute(
        `SELECT COUNT(*) as total FROM users ${userSearch.query} AND id != ?`,
        [...userSearch.params, req.user.id]
      );

      searchResults.users = {
        data: users,
        pagination: getPaginationMeta(page, limit, userCount[0].total)
      };
    }

    return successResponse(res, searchResults, 'Search completed successfully');

  } catch (error) {
    console.error('Search error:', error);
    return errorResponse(res, 500, 'Search failed', error.message);
  }
});

// Search jobs specifically
router.get('/jobs', optionalAuth, async (req, res) => {
  try {
    const { q: searchTerm, location, remote, salary_min, salary_max, tags } = req.query;
    const { page, limit, offset } = getPaginationParams(req);

    let whereConditions = [];
    let params = [];

    // Text search
    if (searchTerm && searchTerm.trim().length >= 2) {
      const search = buildSearchQuery(searchTerm, ['title', 'company', 'description']);
      whereConditions.push(`(${search.query.replace('WHERE ', '')})`);
      params.push(...search.params);
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

    // Salary filters
    if (salary_min) {
      whereConditions.push('salary_max >= ?');
      params.push(parseInt(salary_min));
    }

    if (salary_max) {
      whereConditions.push('salary_min <= ?');
      params.push(parseInt(salary_max));
    }

    // Tags filter
    if (tags) {
      const tagList = tags.split(',').map(tag => tag.trim());
      const tagConditions = tagList.map(() => 'JSON_SEARCH(tags, "one", ?) IS NOT NULL');
      whereConditions.push(`(${tagConditions.join(' OR ')})`);
      params.push(...tagList);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get jobs
    const [jobs] = await pool.execute(
      `SELECT id, title, company, location, salary_min, salary_max, tags, description, is_remote, is_fulltime, created_at
       FROM jobs 
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Get total count
    const [count] = await pool.execute(
      `SELECT COUNT(*) as total FROM jobs ${whereClause}`,
      params
    );

    return successResponse(res, {
      data: jobs,
      pagination: getPaginationMeta(page, limit, count[0].total)
    }, 'Jobs search completed successfully');

  } catch (error) {
    console.error('Jobs search error:', error);
    return errorResponse(res, 500, 'Jobs search failed', error.message);
  }
});

// Search courses specifically
router.get('/courses', optionalAuth, async (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    const { page, limit, offset } = getPaginationParams(req);

    let whereClause = '';
    let params = [];

    if (searchTerm && searchTerm.trim().length >= 2) {
      const search = buildSearchQuery(searchTerm, ['title', 'description']);
      whereClause = search.query;
      params = search.params;
    }

    // Get courses
    const [courses] = await pool.execute(
      `SELECT id, title, description, image_url, xp_reward, created_at
       FROM courses 
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Get total count
    const [count] = await pool.execute(
      `SELECT COUNT(*) as total FROM courses ${whereClause}`,
      params
    );

    return successResponse(res, {
      data: courses,
      pagination: getPaginationMeta(page, limit, count[0].total)
    }, 'Courses search completed successfully');

  } catch (error) {
    console.error('Courses search error:', error);
    return errorResponse(res, 500, 'Courses search failed', error.message);
  }
});

// Search community posts
router.get('/posts', optionalAuth, async (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    const { page, limit, offset } = getPaginationParams(req);

    let whereClause = '';
    let params = [];

    if (searchTerm && searchTerm.trim().length >= 2) {
      const search = buildSearchQuery(searchTerm, ['content']);
      whereClause = `WHERE ${search.query.replace('WHERE ', '')}`;
      params = search.params;
    }

    // Get posts with author info
    const [posts] = await pool.execute(
      `SELECT p.id, p.content, p.image_url, p.likes_count, p.created_at, 
              u.id as author_id, u.name as author_name, u.avatar_url as author_avatar, u.title as author_title
       FROM community_posts p
       JOIN users u ON p.user_id = u.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Get total count
    const [count] = await pool.execute(
      `SELECT COUNT(*) as total FROM community_posts p ${whereClause}`,
      params
    );

    return successResponse(res, {
      data: posts,
      pagination: getPaginationMeta(page, limit, count[0].total)
    }, 'Posts search completed successfully');

  } catch (error) {
    console.error('Posts search error:', error);
    return errorResponse(res, 500, 'Posts search failed', error.message);
  }
});

// Search users (authenticated only)
router.get('/users', requireAuth, async (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    const { page, limit, offset } = getPaginationParams(req);

    let whereClause = 'WHERE id != ?';
    let params = [req.user.id];

    if (searchTerm && searchTerm.trim().length >= 2) {
      const search = buildSearchQuery(searchTerm, ['name', 'title']);
      whereClause += ` AND (${search.query.replace('WHERE ', '')})`;
      params.push(...search.params);
    }

    // Get users
    const [users] = await pool.execute(
      `SELECT id, name, avatar_url, title, xp_total, streak_count, last_active_date
       FROM users 
       ${whereClause}
       ORDER BY xp_total DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Get total count
    const [count] = await pool.execute(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );

    return successResponse(res, {
      data: users,
      pagination: getPaginationMeta(page, limit, count[0].total)
    }, 'Users search completed successfully');

  } catch (error) {
    console.error('Users search error:', error);
    return errorResponse(res, 500, 'Users search failed', error.message);
  }
});

// Get search suggestions
router.get('/suggestions', optionalAuth, async (req, res) => {
  try {
    const { q: searchTerm } = req.query;

    if (!searchTerm || searchTerm.trim().length < 2) {
      return successResponse(res, [], 'No suggestions available');
    }

    const suggestions = [];

    // Get job title suggestions
    const [jobTitles] = await pool.execute(
      `SELECT DISTINCT title FROM jobs WHERE title LIKE ? LIMIT 5`,
      [`%${searchTerm}%`]
    );
    suggestions.push(...jobTitles.map(job => ({ type: 'job', text: job.title })));

    // Get course title suggestions
    const [courseTitles] = await pool.execute(
      `SELECT DISTINCT title FROM courses WHERE title LIKE ? LIMIT 5`,
      [`%${searchTerm}%`]
    );
    suggestions.push(...courseTitles.map(course => ({ type: 'course', text: course.title })));

    // Get skill suggestions
    const [skills] = await pool.execute(
      `SELECT DISTINCT name FROM skills WHERE name LIKE ? LIMIT 5`,
      [`%${searchTerm}%`]
    );
    suggestions.push(...skills.map(skill => ({ type: 'skill', text: skill.name })));

    return successResponse(res, suggestions.slice(0, 10), 'Search suggestions retrieved successfully');

  } catch (error) {
    console.error('Search suggestions error:', error);
    return errorResponse(res, 500, 'Failed to get search suggestions', error.message);
  }
});

module.exports = router;