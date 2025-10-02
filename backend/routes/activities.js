const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { errorResponse, successResponse } = require('../utils/helpers');

const router = express.Router();

// Get user's activities
router.get('/users/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    // Check if user is getting their own activities
    if (userId !== req.user.id) {
      return errorResponse(res, 403, 'You can only view your own activities');
    }

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

// Get recent activities (for dashboard widget)
router.get('/users/:userId/recent', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit) || 4;

    // Check if user is getting their own activities
    if (userId !== req.user.id) {
      return errorResponse(res, 403, 'You can only view your own activities');
    }

    const [activities] = await pool.execute(
      `SELECT type, meta, xp_earned, created_at
       FROM activities
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [userId, limit]
    );

    return successResponse(res, activities, 'Recent activities retrieved successfully');

  } catch (error) {
    console.error('Get recent activities error:', error);
    return errorResponse(res, 500, 'Failed to retrieve recent activities', error.message);
  }
});

// Get activities by type
router.get('/users/:userId/type/:type', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const activityType = req.params.type;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    // Check if user is getting their own activities
    if (userId !== req.user.id) {
      return errorResponse(res, 403, 'You can only view your own activities');
    }

    const validTypes = ['quiz_complete', 'challenge_complete', 'cv_review', 'streak_achieved', 'community_post', 'rank_change', 'skill_added'];
    if (!validTypes.includes(activityType)) {
      return errorResponse(res, 400, 'Invalid activity type');
    }

    const [activities] = await pool.execute(
      `SELECT type, meta, xp_earned, created_at
       FROM activities
       WHERE user_id = ? AND type = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, activityType, limit, offset]
    );

    // Get total count for pagination
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM activities WHERE user_id = ? AND type = ?',
      [userId, activityType]
    );

    return successResponse(res, {
      activities,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    }, `${activityType} activities retrieved successfully`);

  } catch (error) {
    console.error('Get activities by type error:', error);
    return errorResponse(res, 500, 'Failed to retrieve activities', error.message);
  }
});

// Get activity statistics
router.get('/users/:userId/stats', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    // Check if user is getting their own stats
    if (userId !== req.user.id) {
      return errorResponse(res, 403, 'You can only view your own activity statistics');
    }

    // Get activity counts by type
    const [activityStats] = await pool.execute(
      `SELECT 
         type,
         COUNT(*) as count,
         SUM(xp_earned) as total_xp
       FROM activities
       WHERE user_id = ?
       GROUP BY type
       ORDER BY count DESC`,
      [userId]
    );

    // Get total activities and XP
    const [totalStats] = await pool.execute(
      `SELECT 
         COUNT(*) as total_activities,
         SUM(xp_earned) as total_xp_earned,
         MIN(created_at) as first_activity,
         MAX(created_at) as last_activity
       FROM activities
       WHERE user_id = ?`,
      [userId]
    );

    // Get recent activity streak (consecutive days with activities)
    const [streakData] = await pool.execute(
      `SELECT DATE(created_at) as activity_date
       FROM activities
       WHERE user_id = ?
       GROUP BY DATE(created_at)
       ORDER BY activity_date DESC
       LIMIT 30`,
      [userId]
    );

    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    let checkDate = new Date(today);

    for (const activity of streakData) {
      const activityDate = activity.activity_date.toISOString().split('T')[0];
      const expectedDate = checkDate.toISOString().split('T')[0];
      
      if (activityDate === expectedDate) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return successResponse(res, {
      activity_stats: activityStats,
      total_stats: totalStats[0],
      current_streak: currentStreak
    }, 'Activity statistics retrieved successfully');

  } catch (error) {
    console.error('Get activity stats error:', error);
    return errorResponse(res, 500, 'Failed to retrieve activity statistics', error.message);
  }
});

module.exports = router;
