const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Required authentication middleware
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    // Get user from database
    const [users] = await pool.execute(
      'SELECT id, email, name, avatar_url, random_image_id, xp_total, streak_count, last_active_date, title, study_time FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// Optional authentication middleware
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    // Get user from database
    const [users] = await pool.execute(
      'SELECT id, email, name, avatar_url, random_image_id, xp_total, streak_count, last_active_date, title, study_time FROM users WHERE id = ?',
      [decoded.userId]
    );

    req.user = users.length > 0 ? users[0] : null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// Admin authentication middleware
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Check if user is admin (you can add admin field to users table)
    const [users] = await pool.execute(
      'SELECT is_admin FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0 || !users[0].is_admin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Rate limiting middleware
const rateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [id, data] of requests.entries()) {
      if (data.windowStart < windowStart) {
        requests.delete(id);
      }
    }

    // Get or create client data
    let clientData = requests.get(clientId);
    if (!clientData) {
      clientData = {
        count: 0,
        windowStart: now
      };
      requests.set(clientId, clientData);
    }

    // Reset window if needed
    if (clientData.windowStart < windowStart) {
      clientData.count = 0;
      clientData.windowStart = now;
    }

    // Check rate limit
    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later'
      });
    }

    clientData.count++;
    next();
  };
};

// Update user activity (for streak tracking)
const updateUserActivity = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get user's last active date
    const [users] = await pool.execute(
      'SELECT last_active_date, streak_count FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) return;

    const user = users[0];
    const lastActiveDate = user.last_active_date;
    let newStreakCount = user.streak_count;

    // Calculate new streak
    if (lastActiveDate) {
      const lastActive = new Date(lastActiveDate);
      const todayDate = new Date(today);
      const diffTime = todayDate - lastActive;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        newStreakCount += 1;
      } else if (diffDays > 1) {
        // Streak broken
        newStreakCount = 1;
      }
      // If diffDays === 0, it's the same day, keep current streak
    } else {
      // First activity
      newStreakCount = 1;
    }

    // Update user activity
    await pool.execute(
      'UPDATE users SET last_active_date = ?, streak_count = ? WHERE id = ?',
      [today, newStreakCount, userId]
    );

    // Update title based on XP
    await updateUserTitle(userId);

  } catch (error) {
    console.error('Error updating user activity:', error);
  }
};

// Update user title based on XP
const updateUserTitle = async (userId) => {
  try {
    const [users] = await pool.execute(
      'SELECT xp_total FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) return;

    const xpTotal = users[0].xp_total;
    let newTitle = 'Beginner';

    if (xpTotal >= 10000) {
      newTitle = 'Expert';
    } else if (xpTotal >= 5000) {
      newTitle = 'Advanced';
    } else if (xpTotal >= 2000) {
      newTitle = 'Intermediate';
    }

    await pool.execute(
      'UPDATE users SET title = ? WHERE id = ?',
      [newTitle, userId]
    );

  } catch (error) {
    console.error('Error updating user title:', error);
  }
};

// Add XP to user
const addXP = async (userId, xpAmount, sourceType, sourceId) => {
  try {
    // Add XP to user
    await pool.execute(
      'UPDATE users SET xp_total = xp_total + ? WHERE id = ?',
      [xpAmount, userId]
    );

    // Record in XP history
    await pool.execute(
      'INSERT INTO user_xp_history (user_id, source_type, source_id, xp_amount) VALUES (?, ?, ?, ?)',
      [userId, sourceType, sourceId, xpAmount]
    );

    // Record activity
    await pool.execute(
      'INSERT INTO activities (user_id, type, meta, xp_earned) VALUES (?, ?, ?, ?)',
      [userId, sourceType, JSON.stringify({ source_id: sourceId }), xpAmount]
    );

    // Update user activity and title
    await updateUserActivity(userId);

  } catch (error) {
    console.error('Error adding XP:', error);
  }
};

module.exports = {
  generateToken,
  verifyToken,
  requireAuth,
  optionalAuth,
  requireAdmin,
  rateLimit,
  updateUserActivity,
  updateUserTitle,
  addXP
};