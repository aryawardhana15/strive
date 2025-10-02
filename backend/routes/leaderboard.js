const express = require('express');
const pool = require('../config/database');
const { optionalAuth } = require('../middleware/auth');
const { errorResponse, successResponse } = require('../utils/helpers');

const router = express.Router();

// Get global leaderboard
router.get('/', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const [leaderboard] = await pool.execute(
      `SELECT id, name, avatar_url, title, xp_total, streak_count, created_at,
              ROW_NUMBER() OVER (ORDER BY xp_total DESC) as rank
       FROM users
       ORDER BY xp_total DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    // Get total count for pagination
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM users'
    );

    // Get current user's rank if authenticated
    let userRank = null;
    if (req.user) {
      const [userRankResult] = await pool.execute(
        'SELECT COUNT(*) + 1 as rank FROM users WHERE xp_total > ?',
        [req.user.xp_total]
      );
      userRank = userRankResult[0].rank;
    }

    return successResponse(res, {
      leaderboard,
      user_rank: userRank,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    }, 'Leaderboard retrieved successfully');

  } catch (error) {
    console.error('Get leaderboard error:', error);
    return errorResponse(res, 500, 'Failed to retrieve leaderboard', error.message);
  }
});

// Get streak leaderboard
router.get('/streaks', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const [streakLeaderboard] = await pool.execute(
      `SELECT id, name, avatar_url, title, streak_count, xp_total,
              ROW_NUMBER() OVER (ORDER BY streak_count DESC, xp_total DESC) as rank
       FROM users
       WHERE streak_count > 0
       ORDER BY streak_count DESC, xp_total DESC
       LIMIT ?`,
      [limit]
    );

    return successResponse(res, streakLeaderboard, 'Streak leaderboard retrieved successfully');

  } catch (error) {
    console.error('Get streak leaderboard error:', error);
    return errorResponse(res, 500, 'Failed to retrieve streak leaderboard', error.message);
  }
});

// Get challenge leaderboard
router.get('/challenges', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const [challengeLeaderboard] = await pool.execute(
      `SELECT u.id, u.name, u.avatar_url, u.title,
              COUNT(uc.challenge_id) as completed_challenges,
              SUM(c.xp_reward) as total_challenge_xp,
              AVG(uc.score) as average_score,
              ROW_NUMBER() OVER (ORDER BY COUNT(uc.challenge_id) DESC, SUM(c.xp_reward) DESC) as rank
       FROM users u
       JOIN user_challenges uc ON u.id = uc.user_id
       JOIN challenges c ON uc.challenge_id = c.id
       WHERE uc.status = 'completed'
       GROUP BY u.id, u.name, u.avatar_url, u.title
       ORDER BY completed_challenges DESC, total_challenge_xp DESC
       LIMIT ?`,
      [limit]
    );

    return successResponse(res, challengeLeaderboard, 'Challenge leaderboard retrieved successfully');

  } catch (error) {
    console.error('Get challenge leaderboard error:', error);
    return errorResponse(res, 500, 'Failed to retrieve challenge leaderboard', error.message);
  }
});

// Get community leaderboard (most active posters)
router.get('/community', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const [communityLeaderboard] = await pool.execute(
      `SELECT u.id, u.name, u.avatar_url, u.title,
              COUNT(p.id) as total_posts,
              SUM(p.likes_count) as total_likes,
              COUNT(pc.id) as total_comments,
              ROW_NUMBER() OVER (ORDER BY COUNT(p.id) DESC, SUM(p.likes_count) DESC) as rank
       FROM users u
       LEFT JOIN community_posts p ON u.id = p.user_id
       LEFT JOIN post_comments pc ON u.id = pc.user_id
       GROUP BY u.id, u.name, u.avatar_url, u.title
       HAVING total_posts > 0 OR total_comments > 0
       ORDER BY total_posts DESC, total_likes DESC
       LIMIT ?`,
      [limit]
    );

    return successResponse(res, communityLeaderboard, 'Community leaderboard retrieved successfully');

  } catch (error) {
    console.error('Get community leaderboard error:', error);
    return errorResponse(res, 500, 'Failed to retrieve community leaderboard', error.message);
  }
});

// Get user's rank and surrounding users
router.get('/users/:userId/context', optionalAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const contextSize = 5; // Show 5 users above and below

    // Get user's rank
    const [userRankResult] = await pool.execute(
      'SELECT COUNT(*) + 1 as rank FROM users WHERE xp_total > (SELECT xp_total FROM users WHERE id = ?)',
      [userId]
    );

    const userRank = userRankResult[0].rank;

    // Get users around the current user's rank
    const [contextUsers] = await pool.execute(
      `SELECT id, name, avatar_url, title, xp_total, streak_count,
              ROW_NUMBER() OVER (ORDER BY xp_total DESC) as rank
       FROM users
       ORDER BY xp_total DESC
       LIMIT ? OFFSET ?`,
      [contextSize * 2 + 1, Math.max(0, userRank - contextSize - 1)]
    );

    // Get user's own data
    const [userData] = await pool.execute(
      'SELECT id, name, avatar_url, title, xp_total, streak_count FROM users WHERE id = ?',
      [userId]
    );

    return successResponse(res, {
      user_rank: userRank,
      user_data: userData[0],
      context_users: contextUsers
    }, 'User rank context retrieved successfully');

  } catch (error) {
    console.error('Get user rank context error:', error);
    return errorResponse(res, 500, 'Failed to retrieve user rank context', error.message);
  }
});

module.exports = router;
