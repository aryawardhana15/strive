const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validate, registerSchema, loginSchema } = require('../middleware/validation');
const { hashPassword, verifyPassword, generateToken, assignRandomAvatar, updateStreak } = require('../utils/helpers');
const { errorResponse, successResponse } = require('../utils/helpers');

const router = express.Router();

// Register endpoint
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return errorResponse(res, 409, 'User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );

    const userId = result.insertId;

    // Assign random avatar
    await assignRandomAvatar(userId);

    // Generate JWT token
    const token = generateToken(userId);

    // Get user data for response
    const [users] = await pool.execute(
      'SELECT id, name, email, avatar_url, random_image_id, xp_total, streak_count, last_active_date, title, study_time FROM users WHERE id = ?',
      [userId]
    );

    const user = users[0];

    // Update streak for new user
    await updateStreak(userId);

    return successResponse(res, {
      user: user,
      token: token
    }, 'User registered successfully');

  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse(res, 500, 'Registration failed', error.message);
  }
});

// Login endpoint
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const [users] = await pool.execute(
      'SELECT id, name, email, password_hash, avatar_url, random_image_id, xp_total, streak_count, last_active_date, title, study_time FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    // Update streak
    await updateStreak(user.id);

    // Generate JWT token
    const token = generateToken(user.id);

    // Remove password hash from response
    delete user.password_hash;

    return successResponse(res, {
      user: user,
      token: token
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 500, 'Login failed', error.message);
  }
});

// Get current user endpoint
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // User data is already available from authenticateToken middleware
    const user = req.user;

    // Get user's recent activities (last 4)
    const [activities] = await pool.execute(
      `SELECT type, meta, xp_earned, created_at 
       FROM activities 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 4`,
      [user.id]
    );

    // Get user's current rank
    const [rankResult] = await pool.execute(
      'SELECT COUNT(*) + 1 as rank FROM users WHERE xp_total > ?',
      [user.xp_total]
    );

    const userWithExtras = {
      ...user,
      rank: rankResult[0].rank,
      recent_activities: activities
    };

    return successResponse(res, userWithExtras, 'User data retrieved successfully');

  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse(res, 500, 'Failed to retrieve user data', error.message);
  }
});

// Refresh token endpoint (optional)
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const newToken = generateToken(userId);

    return successResponse(res, {
      token: newToken
    }, 'Token refreshed successfully');

  } catch (error) {
    console.error('Token refresh error:', error);
    return errorResponse(res, 500, 'Token refresh failed', error.message);
  }
});

// Logout endpoint (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  // Since we're using stateless JWT, logout is handled client-side
  // In a production app, you might want to implement a token blacklist
  return successResponse(res, null, 'Logout successful');
});

module.exports = router;
