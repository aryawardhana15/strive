const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validate, submitChallengeSchema } = require('../middleware/validation');
const { evaluateCode } = require('../utils/ai');
const { updateUserXP, updateStreak } = require('../utils/helpers');
const { errorResponse, successResponse } = require('../utils/helpers');

const router = express.Router();

// Get all challenges grouped by type
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get challenges grouped by type
    const [challenges] = await pool.execute(
      `SELECT c.id, c.title, c.type, c.description, c.xp_reward, c.created_at,
              uc.status, uc.score, uc.completed_at
       FROM challenges c
       LEFT JOIN user_challenges uc ON c.id = uc.challenge_id AND uc.user_id = ?
       ORDER BY c.type, c.id`,
      [userId]
    );

    // Group challenges by type
    const challengesByType = {
      daily: [],
      weekly: [],
      monthly: []
    };

    challenges.forEach(challenge => {
      challengesByType[challenge.type].push(challenge);
    });

    return successResponse(res, challengesByType, 'Challenges retrieved successfully');

  } catch (error) {
    console.error('Get challenges error:', error);
    return errorResponse(res, 500, 'Failed to retrieve challenges', error.message);
  }
});

// Get challenges by type
router.get('/type/:type', authenticateToken, async (req, res) => {
  try {
    const challengeType = req.params.type;
    const userId = req.user.id;

    if (!['daily', 'weekly', 'monthly'].includes(challengeType)) {
      return errorResponse(res, 400, 'Invalid challenge type');
    }

    const [challenges] = await pool.execute(
      `SELECT c.id, c.title, c.type, c.description, c.xp_reward, c.created_at,
              uc.status, uc.score, uc.completed_at
       FROM challenges c
       LEFT JOIN user_challenges uc ON c.id = uc.challenge_id AND uc.user_id = ?
       WHERE c.type = ?
       ORDER BY c.id`,
      [userId, challengeType]
    );

    return successResponse(res, challenges, `${challengeType} challenges retrieved successfully`);

  } catch (error) {
    console.error('Get challenges by type error:', error);
    return errorResponse(res, 500, 'Failed to retrieve challenges', error.message);
  }
});

// Get challenge by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const challengeId = req.params.id;
    const userId = req.user.id;

    const [challenges] = await pool.execute(
      'SELECT * FROM challenges WHERE id = ?',
      [challengeId]
    );

    if (challenges.length === 0) {
      return errorResponse(res, 404, 'Challenge not found');
    }

    const challenge = challenges[0];

    // Get user's progress on this challenge
    const [userChallenges] = await pool.execute(
      'SELECT status, score, completed_at FROM user_challenges WHERE user_id = ? AND challenge_id = ?',
      [userId, challengeId]
    );

    const userProgress = userChallenges.length > 0 ? userChallenges[0] : null;

    const challengeWithProgress = {
      ...challenge,
      user_progress: userProgress
    };

    return successResponse(res, challengeWithProgress, 'Challenge retrieved successfully');

  } catch (error) {
    console.error('Get challenge error:', error);
    return errorResponse(res, 500, 'Failed to retrieve challenge', error.message);
  }
});

// Start a challenge
router.post('/:id/start', authenticateToken, async (req, res) => {
  try {
    const challengeId = req.params.id;
    const userId = req.user.id;

    // Check if challenge exists
    const [challenges] = await pool.execute(
      'SELECT * FROM challenges WHERE id = ?',
      [challengeId]
    );

    if (challenges.length === 0) {
      return errorResponse(res, 404, 'Challenge not found');
    }

    // Check if user already has a record for this challenge
    const [existingChallenges] = await pool.execute(
      'SELECT status FROM user_challenges WHERE user_id = ? AND challenge_id = ?',
      [userId, challengeId]
    );

    if (existingChallenges.length > 0) {
      const currentStatus = existingChallenges[0].status;
      if (currentStatus === 'completed') {
        return errorResponse(res, 400, 'You have already completed this challenge');
      } else if (currentStatus === 'in_progress') {
        return errorResponse(res, 400, 'You are already working on this challenge');
      }
    }

    // Start the challenge
    await pool.execute(
      'INSERT INTO user_challenges (user_id, challenge_id, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = ?',
      [userId, challengeId, 'in_progress', 'in_progress']
    );

    return successResponse(res, { challenge_id: challengeId, status: 'in_progress' }, 'Challenge started successfully');

  } catch (error) {
    console.error('Start challenge error:', error);
    return errorResponse(res, 500, 'Failed to start challenge', error.message);
  }
});

// Submit challenge solution
router.post('/:id/submit', authenticateToken, validate(submitChallengeSchema), async (req, res) => {
  try {
    const challengeId = req.params.id;
    const userId = req.user.id;
    const { code, language } = req.body;

    // Check if challenge exists
    const [challenges] = await pool.execute(
      'SELECT * FROM challenges WHERE id = ?',
      [challengeId]
    );

    if (challenges.length === 0) {
      return errorResponse(res, 404, 'Challenge not found');
    }

    const challenge = challenges[0];

    // Check if user has started this challenge
    const [userChallenges] = await pool.execute(
      'SELECT status FROM user_challenges WHERE user_id = ? AND challenge_id = ?',
      [userId, challengeId]
    );

    if (userChallenges.length === 0) {
      return errorResponse(res, 400, 'You must start the challenge before submitting');
    }

    if (userChallenges[0].status === 'completed') {
      return errorResponse(res, 400, 'You have already completed this challenge');
    }

    // Evaluate the code using AI
    const evaluationResult = await evaluateCode(code, language, challenge.description);

    // Calculate XP based on score
    const xpEarned = Math.round((evaluationResult.score / 100) * challenge.xp_reward);

    // Update user challenge record
    const status = evaluationResult.passed ? 'completed' : 'failed';
    await pool.execute(
      'UPDATE user_challenges SET status = ?, score = ?, completed_at = ? WHERE user_id = ? AND challenge_id = ?',
      [status, evaluationResult.score, evaluationResult.passed ? new Date() : null, userId, challengeId]
    );

    // Award XP if challenge was passed
    if (evaluationResult.passed) {
      await updateUserXP(userId, xpEarned, 'challenge_complete', challengeId);
      await updateStreak(userId);
    }

    return successResponse(res, {
      passed: evaluationResult.passed,
      score: evaluationResult.score,
      feedback: evaluationResult.feedback,
      hints: evaluationResult.hints,
      test_results: evaluationResult.test_results,
      xp_earned: xpEarned,
      status: status
    }, 'Challenge submitted successfully');

  } catch (error) {
    console.error('Submit challenge error:', error);
    return errorResponse(res, 500, 'Failed to submit challenge', error.message);
  }
});

// Get user's challenge progress
router.get('/users/:userId/progress', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    // Check if user is getting their own progress
    if (userId !== req.user.id) {
      return errorResponse(res, 403, 'You can only view your own challenge progress');
    }

    // Get challenge statistics by type
    const [challengeStats] = await pool.execute(
      `SELECT 
         c.type,
         COUNT(c.id) as total_challenges,
         COUNT(uc.challenge_id) as attempted_challenges,
         SUM(CASE WHEN uc.status = 'completed' THEN 1 ELSE 0 END) as completed_challenges,
         SUM(CASE WHEN uc.status = 'completed' THEN c.xp_reward ELSE 0 END) as total_xp_earned
       FROM challenges c
       LEFT JOIN user_challenges uc ON c.id = uc.challenge_id AND uc.user_id = ?
       GROUP BY c.type`,
      [userId]
    );

    // Get recent challenge attempts
    const [recentAttempts] = await pool.execute(
      `SELECT c.id, c.title, c.type, c.xp_reward,
              uc.status, uc.score, uc.completed_at
       FROM user_challenges uc
       JOIN challenges c ON uc.challenge_id = c.id
       WHERE uc.user_id = ?
       ORDER BY uc.completed_at DESC, uc.created_at DESC
       LIMIT 10`,
      [userId]
    );

    return successResponse(res, {
      statistics: challengeStats,
      recent_attempts: recentAttempts
    }, 'Challenge progress retrieved successfully');

  } catch (error) {
    console.error('Get challenge progress error:', error);
    return errorResponse(res, 500, 'Failed to retrieve challenge progress', error.message);
  }
});

// Get user's completed challenges
router.get('/users/:userId/completed', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Check if user is getting their own completed challenges
    if (userId !== req.user.id) {
      return errorResponse(res, 403, 'You can only view your own completed challenges');
    }

    const [completedChallenges] = await pool.execute(
      `SELECT c.id, c.title, c.type, c.description, c.xp_reward,
              uc.score, uc.completed_at
       FROM user_challenges uc
       JOIN challenges c ON uc.challenge_id = c.id
       WHERE uc.user_id = ? AND uc.status = 'completed'
       ORDER BY uc.completed_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    // Get total count for pagination
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM user_challenges WHERE user_id = ? AND status = ?',
      [userId, 'completed']
    );

    return successResponse(res, {
      challenges: completedChallenges,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    }, 'Completed challenges retrieved successfully');

  } catch (error) {
    console.error('Get completed challenges error:', error);
    return errorResponse(res, 500, 'Failed to retrieve completed challenges', error.message);
  }
});

// Get challenge leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const [leaderboard] = await pool.execute(
      `SELECT u.id, u.name, u.avatar_url, u.title,
              COUNT(uc.challenge_id) as completed_challenges,
              SUM(c.xp_reward) as total_challenge_xp,
              AVG(uc.score) as average_score
       FROM users u
       JOIN user_challenges uc ON u.id = uc.user_id
       JOIN challenges c ON uc.challenge_id = c.id
       WHERE uc.status = 'completed'
       GROUP BY u.id, u.name, u.avatar_url, u.title
       ORDER BY completed_challenges DESC, total_challenge_xp DESC
       LIMIT ?`,
      [limit]
    );

    return successResponse(res, leaderboard, 'Challenge leaderboard retrieved successfully');

  } catch (error) {
    console.error('Get challenge leaderboard error:', error);
    return errorResponse(res, 500, 'Failed to retrieve challenge leaderboard', error.message);
  }
});

module.exports = router;
