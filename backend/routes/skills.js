const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validate, addSkillSchema } = require('../middleware/validation');
const { updateUserXP, updateStreak } = require('../utils/helpers');
const { matchSkillsToJobs } = require('../utils/ai');
const { errorResponse, successResponse } = require('../utils/helpers');

const router = express.Router();

// Get all available skills
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;

    let query = 'SELECT * FROM skills';
    let params = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY category, name';

    const [skills] = await pool.execute(query, params);

    // Group skills by category
    const skillsByCategory = skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {});

    return successResponse(res, {
      skills: skills,
      skillsByCategory: skillsByCategory
    }, 'Skills retrieved successfully');

  } catch (error) {
    console.error('Get skills error:', error);
    return errorResponse(res, 500, 'Failed to retrieve skills', error.message);
  }
});

// Get skill categories
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await pool.execute(
      'SELECT DISTINCT category FROM skills ORDER BY category'
    );

    const categoryList = categories.map(cat => cat.category);

    return successResponse(res, categoryList, 'Skill categories retrieved successfully');

  } catch (error) {
    console.error('Get skill categories error:', error);
    return errorResponse(res, 500, 'Failed to retrieve skill categories', error.message);
  }
});

// Add skill to user
router.post('/users/:userId/skills', authenticateToken, validate(addSkillSchema), async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { skill_id, level } = req.body;

    // Check if user is adding skill to their own profile
    if (userId !== req.user.id) {
      return errorResponse(res, 403, 'You can only add skills to your own profile');
    }

    // Check if skill exists
    const [skills] = await pool.execute(
      'SELECT id, name, category FROM skills WHERE id = ?',
      [skill_id]
    );

    if (skills.length === 0) {
      return errorResponse(res, 404, 'Skill not found');
    }

    // Check if user already has this skill
    const [existingSkills] = await pool.execute(
      'SELECT id FROM user_skills WHERE user_id = ? AND skill_id = ?',
      [userId, skill_id]
    );

    if (existingSkills.length > 0) {
      return errorResponse(res, 409, 'You already have this skill');
    }

    // Add skill to user
    await pool.execute(
      'INSERT INTO user_skills (user_id, skill_id, level) VALUES (?, ?, ?)',
      [userId, skill_id, level]
    );

    // Award XP for adding skill
    await updateUserXP(userId, 10, 'skill_added', skill_id);

    // Update streak
    await updateStreak(userId);

    // Get updated user skills
    const [userSkills] = await pool.execute(
      `SELECT s.id, s.name, s.category, us.level, us.created_at 
       FROM user_skills us 
       JOIN skills s ON us.skill_id = s.id 
       WHERE us.user_id = ? 
       ORDER BY us.created_at DESC`,
      [userId]
    );

    // Generate job recommendations based on new skill
    await generateJobRecommendations(userId);

    return successResponse(res, {
      skill: skills[0],
      level: level,
      userSkills: userSkills
    }, 'Skill added successfully');

  } catch (error) {
    console.error('Add skill error:', error);
    return errorResponse(res, 500, 'Failed to add skill', error.message);
  }
});

// Remove skill from user
router.delete('/users/:userId/skills/:skillId', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const skillId = parseInt(req.params.skillId);

    // Check if user is removing skill from their own profile
    if (userId !== req.user.id) {
      return errorResponse(res, 403, 'You can only remove skills from your own profile');
    }

    // Check if user has this skill
    const [existingSkills] = await pool.execute(
      'SELECT id FROM user_skills WHERE user_id = ? AND skill_id = ?',
      [userId, skillId]
    );

    if (existingSkills.length === 0) {
      return errorResponse(res, 404, 'Skill not found in your profile');
    }

    // Remove skill from user
    await pool.execute(
      'DELETE FROM user_skills WHERE user_id = ? AND skill_id = ?',
      [userId, skillId]
    );

    // Get updated user skills
    const [userSkills] = await pool.execute(
      `SELECT s.id, s.name, s.category, us.level, us.created_at 
       FROM user_skills us 
       JOIN skills s ON us.skill_id = s.id 
       WHERE us.user_id = ? 
       ORDER BY us.created_at DESC`,
      [userId]
    );

    return successResponse(res, userSkills, 'Skill removed successfully');

  } catch (error) {
    console.error('Remove skill error:', error);
    return errorResponse(res, 500, 'Failed to remove skill', error.message);
  }
});

// Update skill level
router.put('/users/:userId/skills/:skillId', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const skillId = parseInt(req.params.skillId);
    const { level } = req.body;

    if (!level || !['beginner', 'intermediate', 'advanced'].includes(level)) {
      return errorResponse(res, 400, 'Invalid skill level');
    }

    // Check if user is updating skill in their own profile
    if (userId !== req.user.id) {
      return errorResponse(res, 403, 'You can only update skills in your own profile');
    }

    // Check if user has this skill
    const [existingSkills] = await pool.execute(
      'SELECT id FROM user_skills WHERE user_id = ? AND skill_id = ?',
      [userId, skillId]
    );

    if (existingSkills.length === 0) {
      return errorResponse(res, 404, 'Skill not found in your profile');
    }

    // Update skill level
    await pool.execute(
      'UPDATE user_skills SET level = ? WHERE user_id = ? AND skill_id = ?',
      [level, userId, skillId]
    );

    // Get updated user skills
    const [userSkills] = await pool.execute(
      `SELECT s.id, s.name, s.category, us.level, us.created_at 
       FROM user_skills us 
       JOIN skills s ON us.skill_id = s.id 
       WHERE us.user_id = ? 
       ORDER BY us.created_at DESC`,
      [userId]
    );

    return successResponse(res, userSkills, 'Skill level updated successfully');

  } catch (error) {
    console.error('Update skill level error:', error);
    return errorResponse(res, 500, 'Failed to update skill level', error.message);
  }
});

// Get user's skills
router.get('/users/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const [userSkills] = await pool.execute(
      `SELECT s.id, s.name, s.category, us.level, us.created_at 
       FROM user_skills us 
       JOIN skills s ON us.skill_id = s.id 
       WHERE us.user_id = ? 
       ORDER BY us.created_at DESC`,
      [userId]
    );

    // Group skills by category
    const skillsByCategory = userSkills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {});

    return successResponse(res, {
      skills: userSkills,
      skillsByCategory: skillsByCategory
    }, 'User skills retrieved successfully');

  } catch (error) {
    console.error('Get user skills error:', error);
    return errorResponse(res, 500, 'Failed to retrieve user skills', error.message);
  }
});

// Generate job recommendations based on user skills
const generateJobRecommendations = async (userId) => {
  try {
    // Get user's skills
    const [userSkills] = await pool.execute(
      `SELECT s.name, us.level 
       FROM user_skills us 
       JOIN skills s ON us.skill_id = s.id 
       WHERE us.user_id = ?`,
      [userId]
    );

    if (userSkills.length === 0) {
      return;
    }

    // Get available jobs
    const [jobs] = await pool.execute(
      'SELECT id, title, company, requirements FROM jobs LIMIT 20'
    );

    if (jobs.length === 0) {
      return;
    }

    // Use AI to match skills to jobs
    const recommendations = await matchSkillsToJobs(userSkills, jobs);

    // Clear existing recommendations for this user
    await pool.execute(
      'DELETE FROM job_recommendations WHERE user_id = ?',
      [userId]
    );

    // Insert new recommendations
    for (const rec of recommendations) {
      await pool.execute(
        'INSERT INTO job_recommendations (user_id, job_id, score, reason) VALUES (?, ?, ?, ?)',
        [userId, rec.job_id, rec.score, rec.reason]
      );
    }

    console.log(`Generated ${recommendations.length} job recommendations for user ${userId}`);

  } catch (error) {
    console.error('Generate job recommendations error:', error);
  }
};

// Trigger job recommendations generation
router.post('/users/:userId/generate-recommendations', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    // Check if user is generating recommendations for their own profile
    if (userId !== req.user.id) {
      return errorResponse(res, 403, 'You can only generate recommendations for your own profile');
    }

    await generateJobRecommendations(userId);

    return successResponse(res, null, 'Job recommendations generated successfully');

  } catch (error) {
    console.error('Generate recommendations error:', error);
    return errorResponse(res, 500, 'Failed to generate job recommendations', error.message);
  }
});

module.exports = router;
