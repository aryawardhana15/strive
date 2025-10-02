const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Password hashing
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Password verification
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// JWT token generation
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// XP calculation helpers
const calculateXP = (activityType, difficulty = 'medium') => {
  const xpValues = {
    quiz_complete: { easy: 10, medium: 20, hard: 30 },
    challenge_complete: { easy: 25, medium: 50, hard: 100 },
    cv_review: { easy: 15, medium: 15, hard: 15 },
    streak_achieved: { easy: 5, medium: 10, hard: 20 },
    community_post: { easy: 5, medium: 5, hard: 5 },
    skill_added: { easy: 10, medium: 10, hard: 10 }
  };

  return xpValues[activityType]?.[difficulty] || 10;
};

// Title calculation based on XP
const calculateTitle = (xpTotal) => {
  if (xpTotal >= 10000) return 'Expert';
  if (xpTotal >= 5000) return 'Advanced';
  if (xpTotal >= 2000) return 'Intermediate';
  if (xpTotal >= 500) return 'Skill Explorer';
  if (xpTotal >= 100) return 'Beginner+';
  return 'Beginner';
};

// Update user XP and title
const updateUserXP = async (userId, xpAmount, sourceType, sourceId = null) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Update user XP
    await connection.execute(
      'UPDATE users SET xp_total = xp_total + ? WHERE id = ?',
      [xpAmount, userId]
    );

    // Get updated user data
    const [users] = await connection.execute(
      'SELECT xp_total FROM users WHERE id = ?',
      [userId]
    );

    if (users.length > 0) {
      const newTitle = calculateTitle(users[0].xp_total);
      
      // Update title if changed
      await connection.execute(
        'UPDATE users SET title = ? WHERE id = ?',
        [newTitle, userId]
      );

      // Log XP history
      await connection.execute(
        'INSERT INTO user_xp_history (user_id, source_type, source_id, xp_amount) VALUES (?, ?, ?, ?)',
        [userId, sourceType, sourceId, xpAmount]
      );

      // Log activity
      await connection.execute(
        'INSERT INTO activities (user_id, type, xp_earned) VALUES (?, ?, ?)',
        [userId, sourceType, xpAmount]
      );
    }

    await connection.commit();
    return { success: true, newTitle };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Streak management
const updateStreak = async (userId) => {
  const today = new Date().toISOString().split('T')[0];
  
  const [users] = await pool.execute(
    'SELECT last_active_date, streak_count FROM users WHERE id = ?',
    [userId]
  );

  if (users.length === 0) return;

  const user = users[0];
  const lastActive = user.last_active_date ? new Date(user.last_active_date).toISOString().split('T')[0] : null;
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  let newStreakCount = user.streak_count;

  if (lastActive === today) {
    // Already active today, no change needed
    return;
  } else if (lastActive === yesterday) {
    // Consecutive day, increment streak
    newStreakCount += 1;
  } else {
    // Streak broken, reset to 1
    newStreakCount = 1;
  }

  await pool.execute(
    'UPDATE users SET streak_count = ?, last_active_date = ? WHERE id = ?',
    [newStreakCount, today, userId]
  );

  // Award streak bonus XP
  if (newStreakCount > 0 && newStreakCount % 7 === 0) {
    const streakXP = Math.min(newStreakCount * 2, 50); // Cap at 50 XP
    await updateUserXP(userId, streakXP, 'streak_achieved');
  }

  return newStreakCount;
};

// Get user rank
const getUserRank = async (userId) => {
  const [users] = await pool.execute(
    'SELECT COUNT(*) + 1 as rank FROM users WHERE xp_total > (SELECT xp_total FROM users WHERE id = ?)',
    [userId]
  );
  
  return users[0].rank;
};

// Generate streak calendar data
const generateStreakCalendar = (streakCount, lastActiveDate) => {
  const calendar = [];
  const today = new Date();
  const lastActive = lastActiveDate ? new Date(lastActiveDate) : null;
  
  // Generate 30 days of calendar data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Check if this date should be marked as active
    let isActive = false;
    if (lastActive) {
      const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
      if (i <= daysDiff && i >= (daysDiff - streakCount + 1)) {
        isActive = true;
      }
    }
    
    calendar.push({
      date: dateStr,
      isActive: isActive
    });
  }
  
  return calendar;
};

// Random avatar assignment
const assignRandomAvatar = async (userId) => {
  const [avatars] = await pool.execute('SELECT id, image_url FROM avatar_images ORDER BY RAND() LIMIT 1');
  
  if (avatars.length > 0) {
    const avatar = avatars[0];
    await pool.execute(
      'UPDATE users SET avatar_url = ?, random_image_id = ? WHERE id = ?',
      [avatar.image_url, avatar.id, userId]
    );
    return avatar.image_url;
  }
  
  return null;
};

// Pagination helper
const paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { offset, limit };
};

// Search helper
const buildSearchQuery = (searchTerm, fields) => {
  if (!searchTerm) return '';
  
  const conditions = fields.map(field => `${field} LIKE ?`).join(' OR ');
  const searchPattern = `%${searchTerm}%`;
  
  return {
    whereClause: `WHERE ${conditions}`,
    params: fields.map(() => searchPattern)
  };
};

// Error response helper
const errorResponse = (res, statusCode, message, details = null) => {
  return res.status(statusCode).json({
    error: message,
    details: details,
    timestamp: new Date().toISOString()
  });
};

// Success response helper
const successResponse = (res, data, message = 'Success') => {
  return res.json({
    success: true,
    message: message,
    data: data,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  calculateXP,
  calculateTitle,
  updateUserXP,
  updateStreak,
  getUserRank,
  generateStreakCalendar,
  assignRandomAvatar,
  paginate,
  buildSearchQuery,
  errorResponse,
  successResponse
};
