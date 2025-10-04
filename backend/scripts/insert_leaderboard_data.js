const pool = require('../config/database');

async function insertLeaderboardData() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await pool.getConnection();
    console.log('✅ Database connected successfully');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await connection.execute('DELETE FROM user_xp_history');
    await connection.execute('DELETE FROM user_challenges');
    await connection.execute('DELETE FROM community_posts');
    await connection.execute('DELETE FROM activities');
    await connection.execute('DELETE FROM user_skills');
    await connection.execute('DELETE FROM user_roadmap_progress');
    await connection.execute('DELETE FROM users WHERE id > 0');

    // Insert sample users with varied XP and streaks
    console.log('👥 Inserting sample users...');
    const users = [
      ['arya@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Arya Pratama', 1, 2450, 7, '2024-01-15', 'Intermediate', 32],
      ['sari@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sari Dewi', 2, 3200, 12, '2024-01-15', 'Advanced', 45],
      ['budi@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Budi Santoso', 3, 1800, 5, '2024-01-14', 'Beginner', 28],
      ['rina@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Rina Sari', 4, 4850, 15, '2024-01-15', 'Expert', 68],
      ['david@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'David Wijaya', 5, 4200, 8, '2024-01-15', 'Advanced', 52],
      ['maya@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Maya Putri', 6, 3600, 20, '2024-01-15', 'Advanced', 41],
      ['tono@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Tono Susanto', 7, 2800, 6, '2024-01-14', 'Intermediate', 35],
      ['lina@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lina Kurnia', 1, 1950, 4, '2024-01-14', 'Beginner', 22],
      ['agus@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Agus Prasetyo', 2, 3200, 11, '2024-01-15', 'Advanced', 48],
      ['nina@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nina Rahayu', 3, 2100, 3, '2024-01-13', 'Beginner', 29]
    ];

    for (const user of users) {
      await connection.execute(
        'INSERT INTO users (email, password_hash, name, random_image_id, xp_total, streak_count, last_active_date, title, study_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        user
      );
    }

    // Insert some community posts for community leaderboard
    console.log('📝 Inserting community posts...');
    const posts = [
      [1, 'Saya sedang belajar React di roadmap, tapi bingung bagian mana yang paling sering ditanya saat interview. Ada tips?', null, 2, '2024-01-15 10:30:00'],
      [2, 'Baru selesai project data analysis dengan Python! Hasilnya cukup memuaskan. Ada yang mau diskusi tentang machine learning?', null, 5, '2024-01-15 11:15:00'],
      [3, 'Hari ini belajar HTML dan CSS dasar. Masih bingung dengan positioning, tapi semangat terus! 💪', null, 3, '2024-01-14 12:00:00'],
      [4, 'Just completed a full-stack project using React and Node.js! The learning curve was steep but totally worth it.', null, 8, '2024-01-15 09:30:00'],
      [5, 'Machine learning is fascinating! Just built my first neural network. Anyone else working on ML projects?', null, 6, '2024-01-15 08:45:00'],
      [6, 'Vue.js vs React - which one should I focus on for my next project? Both seem powerful but I want to master one first.', null, 4, '2024-01-15 11:20:00'],
      [7, 'Node.js async programming can be tricky at first, but once you get the hang of it, it\'s really powerful!', null, 3, '2024-01-14 13:30:00'],
      [8, 'CSS Grid is a game changer! Finally understanding how to create complex layouts easily.', null, 2, '2024-01-14 11:00:00'],
      [9, 'Python for data science is amazing! The pandas library makes data manipulation so much easier.', null, 5, '2024-01-15 12:45:00'],
      [10, 'DOM manipulation with vanilla JavaScript is still relevant! Don\'t skip the fundamentals.', null, 1, '2024-01-13 14:15:00']
    ];

    for (const post of posts) {
      await connection.execute(
        'INSERT INTO community_posts (user_id, content, image_url, likes_count, created_at) VALUES (?, ?, ?, ?, ?)',
        post
      );
    }

    // Insert some user challenges for challenge leaderboard
    console.log('🏆 Inserting user challenges...');
    const challenges = [
      [1, 1, 'completed', 85, '2024-01-15 14:20:00', '2024-01-15 10:00:00'],
      [1, 2, 'completed', 90, '2024-01-14 16:30:00', '2024-01-14 14:00:00'],
      [2, 5, 'completed', 95, '2024-01-14 15:30:00', '2024-01-12 10:00:00'],
      [3, 1, 'completed', 75, '2024-01-14 12:30:00', '2024-01-14 10:00:00'],
      [4, 4, 'completed', 98, '2024-01-14 18:00:00', '2024-01-10 09:00:00'],
      [4, 1, 'completed', 92, '2024-01-13 15:00:00', '2024-01-13 10:00:00'],
      [5, 5, 'completed', 96, '2024-01-13 16:45:00', '2024-01-11 10:00:00'],
      [5, 2, 'completed', 88, '2024-01-12 14:00:00', '2024-01-12 10:00:00'],
      [6, 2, 'completed', 87, '2024-01-15 15:20:00', '2024-01-15 10:00:00'],
      [6, 3, 'completed', 89, '2024-01-14 11:00:00', '2024-01-14 09:00:00'],
      [7, 1, 'completed', 82, '2024-01-13 16:00:00', '2024-01-13 10:00:00'],
      [8, 2, 'completed', 78, '2024-01-12 15:00:00', '2024-01-12 10:00:00'],
      [9, 5, 'completed', 91, '2024-01-14 17:00:00', '2024-01-12 10:00:00'],
      [10, 1, 'completed', 70, '2024-01-13 15:30:00', '2024-01-13 10:00:00']
    ];

    for (const challenge of challenges) {
      await connection.execute(
        'INSERT INTO user_challenges (user_id, challenge_id, status, score, completed_at, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        challenge
      );
    }

    console.log('✅ Leaderboard data inserted successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${users.length} users with varied XP and streaks`);
    console.log(`   - ${posts.length} community posts`);
    console.log(`   - ${challenges.length} completed challenges`);

  } catch (error) {
    console.error('❌ Error inserting leaderboard data:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('🔌 Database connection released');
    }
  }
}

// Run the script
insertLeaderboardData();
