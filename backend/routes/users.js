const express = require('express');
const pool = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const { validate, updateProfileSchema } = require('../middleware/validation');
const { uploadImage, handleUploadError } = require('../middleware/upload');
const { updateStreak, getUserRank, generateStreakCalendar } = require('../utils/helpers');
const { errorResponse, successResponse } = require('../utils/helpers');

const router = express.Router();

// Get user profile
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.params.id;

    const [users] = await pool.execute(
      'SELECT id, name, email, avatar_url, random_image_id, xp_total, streak_count, last_active_date, title, study_time, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return errorResponse(res, 404, 'User not found');
    }

    const user = users[0];

    // Get user's skills
    const [skills] = await pool.execute(
      `SELECT s.id, s.name, s.category, us.level, us.created_at 
       FROM user_skills us 
       JOIN skills s ON us.skill_id = s.id 
       WHERE us.user_id = ? 
       ORDER BY us.created_at DESC`,
      [userId]
    );

    // Get user's rank
    const rank = await getUserRank(userId);

    // Generate streak calendar
    const streakCalendar = generateStreakCalendar(user.streak_count, user.last_active_date);

    const userProfile = {
      ...user,
      rank,
      skills,
      streak_calendar: streakCalendar
    };

    return successResponse(res, userProfile, 'User profile retrieved successfully');

  } catch (error) {
    console.error('Get user profile error:', error);
    return errorResponse(res, 500, 'Failed to retrieve user profile', error.message);
  }
});

// Update user profile
router.put('/:id', requireAuth, validate(updateProfileSchema), async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, avatar_url } = req.body;

    // Check if user is updating their own profile
    if (parseInt(userId) !== req.user.id) {
      return errorResponse(res, 403, 'You can only update your own profile');
    }

    const updateFields = [];
    const updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (avatar_url) {
      updateFields.push('avatar_url = ?');
      updateValues.push(avatar_url);
    }

    if (updateFields.length === 0) {
      return errorResponse(res, 400, 'No fields to update');
    }

    updateValues.push(userId);

    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Get updated user data
    const [users] = await pool.execute(
      'SELECT id, name, email, avatar_url, random_image_id, xp_total, streak_count, last_active_date, title, study_time FROM users WHERE id = ?',
      [userId]
    );

    return successResponse(res, users[0], 'Profile updated successfully');

  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(res, 500, 'Failed to update profile', error.message);
  }
});

// Upload avatar
router.post('/:id/avatar', requireAuth, uploadImage, handleUploadError, async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user is updating their own profile
    if (parseInt(userId) !== req.user.id) {
      return errorResponse(res, 403, 'You can only update your own profile');
    }

    if (!req.file) {
      return errorResponse(res, 400, 'No image file uploaded');
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    await pool.execute(
      'UPDATE users SET avatar_url = ? WHERE id = ?',
      [avatarUrl, userId]
    );

    return successResponse(res, { avatar_url: avatarUrl }, 'Avatar uploaded successfully');

  } catch (error) {
    console.error('Avatar upload error:', error);
    return errorResponse(res, 500, 'Failed to upload avatar', error.message);
  }
});

// Get user activities
router.get('/:id/activities', requireAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const [activities] = await pool.execute(
      `SELECT type, meta, xp_earned, created_at 
       FROM activities 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    // Get total count for pagination
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM activities WHERE user_id = ?',
      [userId]
    );

    return successResponse(res, {
      activities,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    }, 'User activities retrieved successfully');

  } catch (error) {
    console.error('Get user activities error:', error);
    return errorResponse(res, 500, 'Failed to retrieve user activities', error.message);
  }
});

// Get user's recommended jobs
router.get('/:id/recommended-jobs', requireAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    const limit = parseInt(req.query.limit) || 10;

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

// Get user's learning progress
router.get('/:id/progress', requireAuth, async (req, res) => {
  try {
    const userId = req.params.id;

    // Get user's roadmap progress
    const [progress] = await pool.execute(
      `SELECT r.id as roadmap_id, r.title as roadmap_title, r.description,
              COUNT(rs.id) as total_steps,
              COUNT(urp.step_id) as completed_steps,
              ROUND((COUNT(urp.step_id) / COUNT(rs.id)) * 100, 2) as progress_percentage
       FROM roadmaps r
       LEFT JOIN roadmap_steps rs ON r.id = rs.roadmap_id
       LEFT JOIN user_roadmap_progress urp ON rs.id = urp.step_id AND urp.user_id = ? AND urp.completed = true
       GROUP BY r.id, r.title, r.description
       ORDER BY progress_percentage DESC`,
      [userId]
    );

    // Get user's challenge progress
    const [challengeProgress] = await pool.execute(
      `SELECT c.type,
              COUNT(c.id) as total_challenges,
              COUNT(uc.challenge_id) as completed_challenges
       FROM challenges c
       LEFT JOIN user_challenges uc ON c.id = uc.challenge_id AND uc.user_id = ? AND uc.status = 'completed'
       GROUP BY c.type`,
      [userId]
    );

    return successResponse(res, {
      roadmap_progress: progress,
      challenge_progress: challengeProgress
    }, 'Learning progress retrieved successfully');

  } catch (error) {
    console.error('Get learning progress error:', error);
    return errorResponse(res, 500, 'Failed to retrieve learning progress', error.message);
  }
});

// Get user's XP history
router.get('/:id/xp-history', requireAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const [xpHistory] = await pool.execute(
      `SELECT source_type, source_id, xp_amount, created_at
       FROM user_xp_history
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    // Get total count for pagination
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM user_xp_history WHERE user_id = ?',
      [userId]
    );

    return successResponse(res, {
      xp_history: xpHistory,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    }, 'XP history retrieved successfully');

  } catch (error) {
    console.error('Get XP history error:', error);
    return errorResponse(res, 500, 'Failed to retrieve XP history', error.message);
  }
});

module.exports = router;
