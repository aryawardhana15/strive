// Response helpers
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', error = null) => {
  const response = {
    success: false,
    message
  };

  if (error && process.env.NODE_ENV === 'development') {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};

// Validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 6 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
  return passwordRegex.test(password);
};

// File upload helpers
const validateFileSize = (fileSize, maxSize = 2 * 1024 * 1024) => { // 2MB default
  return fileSize <= maxSize;
};

const validateFileType = (mimetype, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']) => {
  return allowedTypes.includes(mimetype);
};

// Pagination helpers
const getPaginationParams = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

const getPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage
  };
};

// Search helpers
const buildSearchQuery = (searchTerm, searchFields) => {
  if (!searchTerm || !searchFields.length) {
    return { query: '', params: [] };
  }

  const conditions = searchFields.map(field => `${field} LIKE ?`).join(' OR ');
  const searchPattern = `%${searchTerm}%`;
  const params = searchFields.map(() => searchPattern);

  return {
    query: `WHERE ${conditions}`,
    params
  };
};

// Date helpers
const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

const getDateRange = (days = 7) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
};

// XP calculation helpers
const calculateXP = (type, difficulty = 'medium') => {
  const xpValues = {
    quiz_complete: { easy: 20, medium: 40, hard: 60 },
    challenge_complete: { easy: 50, medium: 100, hard: 200 },
    cv_review: { easy: 30, medium: 30, hard: 30 },
    streak_achieved: { easy: 10, medium: 10, hard: 10 },
    community_post: { easy: 5, medium: 5, hard: 5 },
    skill_added: { easy: 25, medium: 25, hard: 25 },
    course_complete: { easy: 100, medium: 200, hard: 300 }
  };

  return xpValues[type]?.[difficulty] || 10;
};

// Title calculation helpers
const getTitleFromXP = (xp) => {
  if (xp >= 10000) return 'Expert';
  if (xp >= 5000) return 'Advanced';
  if (xp >= 2000) return 'Intermediate';
  return 'Beginner';
};

// Streak calculation helpers
const calculateStreak = (lastActiveDate, currentStreak) => {
  if (!lastActiveDate) return 1;

  const today = new Date();
  const lastActive = new Date(lastActiveDate);
  const diffTime = today - lastActive;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return currentStreak + 1;
  } else if (diffDays > 1) {
    return 1;
  }

  return currentStreak;
};

// Random helpers
const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Error handling helpers
const handleDatabaseError = (error) => {
  console.error('Database error:', error);
  
  if (error.code === 'ER_DUP_ENTRY') {
    return 'Duplicate entry found';
  } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return 'Referenced record not found';
  } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    return 'Database access denied';
  } else if (error.code === 'ECONNREFUSED') {
    return 'Database connection refused';
  }
  
  return 'Database operation failed';
};

const handleValidationError = (error) => {
  if (error.name === 'ValidationError') {
    return Object.values(error.errors).map(err => err.message).join(', ');
  }
  return error.message;
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Cache helpers (simple in-memory cache)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const setCache = (key, value, ttl = CACHE_TTL) => {
  cache.set(key, {
    value,
    expires: Date.now() + ttl
  });
};

const getCache = (key) => {
  const item = cache.get(key);
  if (!item) return null;
  
  if (Date.now() > item.expires) {
    cache.delete(key);
    return null;
  }
  
  return item.value;
};

const clearCache = (pattern = null) => {
  if (!pattern) {
    cache.clear();
    return;
  }
  
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

// Pagination helper for jobs route
const paginate = (page, limit) => {
  const offset = (page - 1) * limit;
  return { offset, limit };
};

// User XP and streak helpers
const updateUserXP = async (userId, xpAmount, sourceType, sourceId) => {
  const pool = require('../config/database');
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

const updateStreak = async (userId) => {
  const pool = require('../config/database');
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

const updateUserActivity = async (userId) => {
  return updateStreak(userId);
};

const updateUserTitle = async (userId) => {
  const pool = require('../config/database');
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

const getUserRank = async (userId) => {
  const pool = require('../config/database');
  try {
    const [rankResult] = await pool.execute(
      'SELECT COUNT(*) + 1 as rank FROM users WHERE xp_total > (SELECT xp_total FROM users WHERE id = ?)',
      [userId]
    );
    return rankResult[0].rank;
  } catch (error) {
    console.error('Error getting user rank:', error);
    return 1;
  }
};

const generateStreakCalendar = (streakCount, lastActiveDate) => {
  const calendar = [];
  const today = new Date();
  
  // Generate last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const isActive = lastActiveDate && 
      new Date(lastActiveDate).toDateString() === date.toDateString();
    
    calendar.push({
      date: date.toISOString().split('T')[0],
      isActive: isActive || false
    });
  }
  
  return calendar;
};

module.exports = {
  // Response helpers
  successResponse,
  errorResponse,
  
  // Validation helpers
  validateEmail,
  validatePassword,
  validateFileSize,
  validateFileType,
  
  // Pagination helpers
  getPaginationParams,
  getPaginationMeta,
  paginate,
  
  // Search helpers
  buildSearchQuery,
  
  // Date helpers
  formatDate,
  getDateRange,
  
  // XP and title helpers
  calculateXP,
  getTitleFromXP,
  calculateStreak,
  updateUserXP,
  updateStreak,
  updateUserActivity,
  updateUserTitle,
  getUserRank,
  generateStreakCalendar,
  
  // Random helpers
  getRandomElement,
  generateRandomString,
  
  // Error handling
  handleDatabaseError,
  handleValidationError,
  asyncHandler,
  
  // Cache helpers
  setCache,
  getCache,
  clearCache
};