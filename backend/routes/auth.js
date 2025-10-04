const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { generateToken, requireAuth, addXP } = require('../middleware/auth');
const { errorResponse, successResponse } = require('../utils/helpers');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Name, email, and password are required');
    }

    if (password.length < 6) {
      return errorResponse(res, 400, 'Password must be at least 6 characters long');
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return errorResponse(res, 400, 'User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Get random avatar
    const [avatars] = await pool.execute(
      'SELECT id FROM avatar_images ORDER BY RAND() LIMIT 1'
    );
    const randomImageId = avatars.length > 0 ? avatars[0].id : 1;

    // Create user
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password_hash, random_image_id, xp_total, streak_count, title, study_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, passwordHash, randomImageId, 0, 0, 'Beginner', 0]
    );

    const userId = result.insertId;

    // Get avatar URL
    const [avatarData] = await pool.execute(
      'SELECT image_url FROM avatar_images WHERE id = ?',
      [randomImageId]
    );

    // Generate token
    const token = generateToken(userId);

    // Get user data
    const [users] = await pool.execute(
      'SELECT id, name, email, avatar_url, random_image_id, xp_total, streak_count, last_active_date, title, study_time FROM users WHERE id = ?',
      [userId]
    );

    const user = users[0];
    user.avatar_url = avatarData[0].image_url;

    // Add welcome XP
    await addXP(userId, 50, 'skill_added', null);

    return successResponse(res, {
      user,
      token
    }, 'User registered successfully');

  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse(res, 500, 'Registration failed', error.message);
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required');
    }

    // Find user
    const [users] = await pool.execute(
      'SELECT id, name, email, password_hash, avatar_url, random_image_id, xp_total, streak_count, last_active_date, title, study_time FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    // Get avatar URL if not set
    if (!user.avatar_url && user.random_image_id) {
      const [avatarData] = await pool.execute(
        'SELECT image_url FROM avatar_images WHERE id = ?',
        [user.random_image_id]
      );
      if (avatarData.length > 0) {
        user.avatar_url = avatarData[0].image_url;
      }
    }

    // Remove password hash from response
    delete user.password_hash;

    // Generate token
    const token = generateToken(user.id);

    // Update last active date
    const today = new Date().toISOString().split('T')[0];
    await pool.execute(
      'UPDATE users SET last_active_date = ? WHERE id = ?',
      [today, user.id]
    );

    return successResponse(res, {
      user,
      token
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 500, 'Login failed', error.message);
  }
});

// Get current user
router.get('/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user with avatar URL
    const [users] = await pool.execute(
      'SELECT id, name, email, avatar_url, random_image_id, xp_total, streak_count, last_active_date, title, study_time FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return errorResponse(res, 404, 'User not found');
    }

    const user = users[0];

    // Get avatar URL if not set
    if (!user.avatar_url && user.random_image_id) {
      const [avatarData] = await pool.execute(
        'SELECT image_url FROM avatar_images WHERE id = ?',
        [user.random_image_id]
      );
      if (avatarData.length > 0) {
        user.avatar_url = avatarData[0].image_url;
      }
    }

    // Get streak info
    const streakInfo = {
      current_streak: user.streak_count,
      last_active_date: user.last_active_date
    };

    return successResponse(res, {
      ...user,
      streak_info: streakInfo
    }, 'User data retrieved successfully');

  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse(res, 500, 'Failed to get user data', error.message);
  }
});

// Update user profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, avatar_url } = req.body;

    // Validation
    if (!name) {
      return errorResponse(res, 400, 'Name is required');
    }

    // Update user
    await pool.execute(
      'UPDATE users SET name = ?, avatar_url = ? WHERE id = ?',
      [name, avatar_url, userId]
    );

    // Get updated user
    const [users] = await pool.execute(
      'SELECT id, name, email, avatar_url, random_image_id, xp_total, streak_count, last_active_date, title, study_time FROM users WHERE id = ?',
      [userId]
    );

    const user = users[0];

    return successResponse(res, user, 'Profile updated successfully');

  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(res, 500, 'Failed to update profile', error.message);
  }
});

// Refresh token
router.post('/refresh', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const token = generateToken(userId);

    return successResponse(res, { token }, 'Token refreshed successfully');

  } catch (error) {
    console.error('Refresh token error:', error);
    return errorResponse(res, 500, 'Failed to refresh token', error.message);
  }
});

// Logout (client-side token removal)
router.post('/logout', requireAuth, async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just return success as the client will remove the token
    return successResponse(res, {}, 'Logout successful');

  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 500, 'Logout failed', error.message);
  }
});

// Change password
router.put('/change-password', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return errorResponse(res, 400, 'Current password and new password are required');
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 400, 'New password must be at least 6 characters long');
    }

    // Get current password hash
    const [users] = await pool.execute(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return errorResponse(res, 404, 'User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isValidPassword) {
      return errorResponse(res, 401, 'Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, userId]
    );

    return successResponse(res, {}, 'Password changed successfully');

  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse(res, 500, 'Failed to change password', error.message);
  }
});

// Get user title history
router.get('/title-history', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get XP history to determine title progression
    const [xpHistory] = await pool.execute(
      `SELECT xp_amount, created_at, source_type 
       FROM user_xp_history 
       WHERE user_id = ? 
       ORDER BY created_at ASC`,
      [userId]
    );

    let currentXP = 0;
    const titleHistory = [];

    for (const record of xpHistory) {
      currentXP += record.xp_amount;
      
      let title = 'Beginner';
      if (currentXP >= 10000) {
        title = 'Expert';
      } else if (currentXP >= 5000) {
        title = 'Advanced';
      } else if (currentXP >= 2000) {
        title = 'Intermediate';
      }

      titleHistory.push({
        title,
        xp_total: currentXP,
        achieved_at: record.created_at,
        source: record.source_type
      });
    }

    return successResponse(res, titleHistory, 'Title history retrieved successfully');

  } catch (error) {
    console.error('Get title history error:', error);
    return errorResponse(res, 500, 'Failed to get title history', error.message);
  }
});

module.exports = router;