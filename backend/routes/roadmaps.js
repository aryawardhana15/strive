const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validate, submitQuizSchema } = require('../middleware/validation');
const { generateQuiz, gradeQuiz } = require('../utils/ai');
const { updateUserXP, updateStreak } = require('../utils/helpers');
const { errorResponse, successResponse } = require('../utils/helpers');

const router = express.Router();

// Get all roadmaps
router.get('/', async (req, res) => {
  try {
    const [roadmaps] = await pool.execute(
      'SELECT id, title, description, created_at FROM roadmaps ORDER BY title'
    );

    return successResponse(res, roadmaps, 'Roadmaps retrieved successfully');

  } catch (error) {
    console.error('Get roadmaps error:', error);
    return errorResponse(res, 500, 'Failed to retrieve roadmaps', error.message);
  }
});

// Get roadmap by ID with steps
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const roadmapId = req.params.id;
    const userId = req.user.id;

    // Get roadmap details
    const [roadmaps] = await pool.execute(
      'SELECT id, title, description, created_at FROM roadmaps WHERE id = ?',
      [roadmapId]
    );

    if (roadmaps.length === 0) {
      return errorResponse(res, 404, 'Roadmap not found');
    }

    const roadmap = roadmaps[0];

    // Get roadmap steps
    const [steps] = await pool.execute(
      `SELECT rs.id, rs.title, rs.order_index, rs.content, rs.quiz_id,
              urp.completed, urp.completed_at
       FROM roadmap_steps rs
       LEFT JOIN user_roadmap_progress urp ON rs.id = urp.step_id AND urp.user_id = ?
       WHERE rs.roadmap_id = ?
       ORDER BY rs.order_index`,
      [userId, roadmapId]
    );

    // Get user's overall progress
    const [progressResult] = await pool.execute(
      `SELECT 
         COUNT(rs.id) as total_steps,
         COUNT(urp.step_id) as completed_steps,
         ROUND((COUNT(urp.step_id) / COUNT(rs.id)) * 100, 2) as progress_percentage
       FROM roadmap_steps rs
       LEFT JOIN user_roadmap_progress urp ON rs.id = urp.step_id AND urp.user_id = ? AND urp.completed = true
       WHERE rs.roadmap_id = ?`,
      [userId, roadmapId]
    );

    const roadmapWithSteps = {
      ...roadmap,
      steps: steps,
      progress: progressResult[0]
    };

    return successResponse(res, roadmapWithSteps, 'Roadmap retrieved successfully');

  } catch (error) {
    console.error('Get roadmap error:', error);
    return errorResponse(res, 500, 'Failed to retrieve roadmap', error.message);
  }
});

// Get roadmap steps
router.get('/:id/steps', authenticateToken, async (req, res) => {
  try {
    const roadmapId = req.params.id;
    const userId = req.user.id;

    const [steps] = await pool.execute(
      `SELECT rs.id, rs.title, rs.order_index, rs.content, rs.quiz_id,
              urp.completed, urp.completed_at
       FROM roadmap_steps rs
       LEFT JOIN user_roadmap_progress urp ON rs.id = urp.step_id AND urp.user_id = ?
       WHERE rs.roadmap_id = ?
       ORDER BY rs.order_index`,
      [userId, roadmapId]
    );

    return successResponse(res, steps, 'Roadmap steps retrieved successfully');

  } catch (error) {
    console.error('Get roadmap steps error:', error);
    return errorResponse(res, 500, 'Failed to retrieve roadmap steps', error.message);
  }
});

// Get quiz for a specific step
router.get('/:roadmapId/step/:stepId/quiz', authenticateToken, async (req, res) => {
  try {
    const roadmapId = req.params.roadmapId;
    const stepId = req.params.stepId;
    const userId = req.user.id;

    // Verify step belongs to roadmap
    const [steps] = await pool.execute(
      'SELECT id, title, quiz_id FROM roadmap_steps WHERE id = ? AND roadmap_id = ?',
      [stepId, roadmapId]
    );

    if (steps.length === 0) {
      return errorResponse(res, 404, 'Step not found in this roadmap');
    }

    const step = steps[0];

    // Check if user has already completed this step
    const [progress] = await pool.execute(
      'SELECT completed FROM user_roadmap_progress WHERE user_id = ? AND step_id = ?',
      [userId, stepId]
    );

    if (progress.length > 0 && progress[0].completed) {
      return errorResponse(res, 400, 'You have already completed this step');
    }

    // Check if quiz already exists
    let quiz;
    if (step.quiz_id) {
      const [existingQuizzes] = await pool.execute(
        'SELECT id, questions FROM quizzes WHERE id = ?',
        [step.quiz_id]
      );

      if (existingQuizzes.length > 0) {
        quiz = existingQuizzes[0];
      }
    }

    // Generate new quiz if none exists
    if (!quiz) {
      const quizData = await generateQuiz(step.title, 'intermediate');
      
      // Save quiz to database
      const [quizResult] = await pool.execute(
        'INSERT INTO quizzes (step_id, questions) VALUES (?, ?)',
        [stepId, JSON.stringify(quizData.questions)]
      );

      const quizId = quizResult.insertId;

      // Update step with quiz_id
      await pool.execute(
        'UPDATE roadmap_steps SET quiz_id = ? WHERE id = ?',
        [quizId, stepId]
      );

      quiz = {
        id: quizId,
        questions: quizData.questions
      };
    } else {
      // Parse existing quiz questions
      quiz.questions = JSON.parse(quiz.questions);
    }

    return successResponse(res, {
      step_id: stepId,
      step_title: step.title,
      quiz: quiz
    }, 'Quiz retrieved successfully');

  } catch (error) {
    console.error('Get quiz error:', error);
    return errorResponse(res, 500, 'Failed to retrieve quiz', error.message);
  }
});

// Submit quiz answers
router.post('/:roadmapId/step/:stepId/submit-quiz', authenticateToken, validate(submitQuizSchema), async (req, res) => {
  try {
    const roadmapId = req.params.roadmapId;
    const stepId = req.params.stepId;
    const userId = req.user.id;
    const { answers } = req.body;

    // Verify step belongs to roadmap
    const [steps] = await pool.execute(
      'SELECT id, title, quiz_id FROM roadmap_steps WHERE id = ? AND roadmap_id = ?',
      [stepId, roadmapId]
    );

    if (steps.length === 0) {
      return errorResponse(res, 404, 'Step not found in this roadmap');
    }

    const step = steps[0];

    // Check if user has already completed this step
    const [existingProgress] = await pool.execute(
      'SELECT completed FROM user_roadmap_progress WHERE user_id = ? AND step_id = ?',
      [userId, stepId]
    );

    if (existingProgress.length > 0 && existingProgress[0].completed) {
      return errorResponse(res, 400, 'You have already completed this step');
    }

    // Get quiz questions
    const [quizzes] = await pool.execute(
      'SELECT questions FROM quizzes WHERE step_id = ?',
      [stepId]
    );

    if (quizzes.length === 0) {
      return errorResponse(res, 404, 'Quiz not found for this step');
    }

    const questions = JSON.parse(quizzes[0].questions);

    // Grade the quiz using AI
    const gradingResult = await gradeQuiz(questions, answers);

    // Calculate XP based on score
    const xpEarned = Math.round((gradingResult.score / 100) * 30); // Max 30 XP for quiz

    // Mark step as completed if score >= 50%
    const isCompleted = gradingResult.score >= 50;

    if (isCompleted) {
      // Record progress
      await pool.execute(
        'INSERT INTO user_roadmap_progress (user_id, roadmap_id, step_id, completed, completed_at) VALUES (?, ?, ?, true, NOW()) ON DUPLICATE KEY UPDATE completed = true, completed_at = NOW()',
        [userId, roadmapId, stepId]
      );

      // Award XP
      await updateUserXP(userId, xpEarned, 'quiz_complete', stepId);

      // Update streak
      await updateStreak(userId);
    }

    return successResponse(res, {
      score: gradingResult.score,
      total_questions: gradingResult.total_questions,
      correct_answers: gradingResult.correct_answers,
      feedback: gradingResult.feedback,
      detailed_results: gradingResult.detailed_results,
      xp_earned: xpEarned,
      completed: isCompleted
    }, 'Quiz submitted successfully');

  } catch (error) {
    console.error('Submit quiz error:', error);
    return errorResponse(res, 500, 'Failed to submit quiz', error.message);
  }
});

// Get user's roadmap progress
router.get('/:id/progress', authenticateToken, async (req, res) => {
  try {
    const roadmapId = req.params.id;
    const userId = req.user.id;

    // Get overall progress
    const [progressResult] = await pool.execute(
      `SELECT 
         COUNT(rs.id) as total_steps,
         COUNT(urp.step_id) as completed_steps,
         ROUND((COUNT(urp.step_id) / COUNT(rs.id)) * 100, 2) as progress_percentage
       FROM roadmap_steps rs
       LEFT JOIN user_roadmap_progress urp ON rs.id = urp.step_id AND urp.user_id = ? AND urp.completed = true
       WHERE rs.roadmap_id = ?`,
      [userId, roadmapId]
    );

    // Get detailed step progress
    const [stepProgress] = await pool.execute(
      `SELECT rs.id, rs.title, rs.order_index,
              urp.completed, urp.completed_at
       FROM roadmap_steps rs
       LEFT JOIN user_roadmap_progress urp ON rs.id = urp.step_id AND urp.user_id = ?
       WHERE rs.roadmap_id = ?
       ORDER BY rs.order_index`,
      [userId, roadmapId]
    );

    return successResponse(res, {
      overall_progress: progressResult[0],
      step_progress: stepProgress
    }, 'Roadmap progress retrieved successfully');

  } catch (error) {
    console.error('Get roadmap progress error:', error);
    return errorResponse(res, 500, 'Failed to retrieve roadmap progress', error.message);
  }
});

// Get user's learning statistics
router.get('/users/:userId/stats', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    // Check if user is getting their own stats
    if (userId !== req.user.id) {
      return errorResponse(res, 403, 'You can only view your own learning statistics');
    }

    // Get user's rank
    const [rankResult] = await pool.execute(
      'SELECT COUNT(*) + 1 as rank FROM users WHERE xp_total > (SELECT xp_total FROM users WHERE id = ?)',
      [userId]
    );

    // Get total XP
    const [xpResult] = await pool.execute(
      'SELECT xp_total, study_time FROM users WHERE id = ?',
      [userId]
    );

    // Get active courses (roadmaps with progress > 0)
    const [activeCourses] = await pool.execute(
      `SELECT COUNT(DISTINCT r.id) as active_courses
       FROM roadmaps r
       JOIN user_roadmap_progress urp ON r.id = urp.roadmap_id
       WHERE urp.user_id = ? AND urp.completed = true`,
      [userId]
    );

    // Get completed courses (roadmaps with 100% progress)
    const [completedCourses] = await pool.execute(
      `SELECT COUNT(DISTINCT r.id) as completed_courses
       FROM roadmaps r
       JOIN roadmap_steps rs ON r.id = rs.roadmap_id
       LEFT JOIN user_roadmap_progress urp ON rs.id = urp.step_id AND urp.user_id = ? AND urp.completed = true
       WHERE r.id IN (
         SELECT roadmap_id FROM user_roadmap_progress WHERE user_id = ?
       )
       GROUP BY r.id
       HAVING COUNT(urp.step_id) = COUNT(rs.id)`,
      [userId, userId]
    );

    const stats = {
      rank: rankResult[0].rank,
      total_xp: xpResult[0].xp_total,
      study_time: xpResult[0].study_time,
      active_courses: activeCourses[0].active_courses,
      completed_courses: completedCourses.length
    };

    return successResponse(res, stats, 'Learning statistics retrieved successfully');

  } catch (error) {
    console.error('Get learning statistics error:', error);
    return errorResponse(res, 500, 'Failed to retrieve learning statistics', error.message);
  }
});

module.exports = router;
