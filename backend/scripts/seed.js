const pool = require('../config/database');
require('dotenv').config();

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Clearing existing data...');
    await pool.execute('DELETE FROM user_xp_history');
    await pool.execute('DELETE FROM post_comments');
    await pool.execute('DELETE FROM post_likes');
    await pool.execute('DELETE FROM community_posts');
    await pool.execute('DELETE FROM cv_reviews');
    await pool.execute('DELETE FROM user_challenges');
    await pool.execute('DELETE FROM user_roadmap_progress');
    await pool.execute('DELETE FROM quizzes');
    await pool.execute('DELETE FROM roadmap_steps');
    await pool.execute('DELETE FROM job_recommendations');
    await pool.execute('DELETE FROM user_skills');
    await pool.execute('DELETE FROM activities');
    await pool.execute('DELETE FROM challenges');
    await pool.execute('DELETE FROM roadmaps');
    await pool.execute('DELETE FROM courses');
    await pool.execute('DELETE FROM jobs');
    await pool.execute('DELETE FROM skills');
    await pool.execute('DELETE FROM users');

    // Insert skills
    console.log('📚 Inserting skills...');
    const skills = [
      // Programming Languages
      { name: 'JavaScript', category: 'Programming Languages' },
      { name: 'Python', category: 'Programming Languages' },
      { name: 'Java', category: 'Programming Languages' },
      { name: 'TypeScript', category: 'Programming Languages' },
      { name: 'C++', category: 'Programming Languages' },
      { name: 'C#', category: 'Programming Languages' },
      { name: 'Go', category: 'Programming Languages' },
      { name: 'Rust', category: 'Programming Languages' },
      { name: 'PHP', category: 'Programming Languages' },
      { name: 'Ruby', category: 'Programming Languages' },

      // Frontend Technologies
      { name: 'React', category: 'Frontend' },
      { name: 'Vue.js', category: 'Frontend' },
      { name: 'Angular', category: 'Frontend' },
      { name: 'HTML', category: 'Frontend' },
      { name: 'CSS', category: 'Frontend' },
      { name: 'Sass', category: 'Frontend' },
      { name: 'Tailwind CSS', category: 'Frontend' },
      { name: 'Bootstrap', category: 'Frontend' },
      { name: 'jQuery', category: 'Frontend' },
      { name: 'Next.js', category: 'Frontend' },

      // Backend Technologies
      { name: 'Node.js', category: 'Backend' },
      { name: 'Express.js', category: 'Backend' },
      { name: 'Django', category: 'Backend' },
      { name: 'Flask', category: 'Backend' },
      { name: 'Spring Boot', category: 'Backend' },
      { name: 'Laravel', category: 'Backend' },
      { name: 'Ruby on Rails', category: 'Backend' },
      { name: 'ASP.NET', category: 'Backend' },
      { name: 'FastAPI', category: 'Backend' },
      { name: 'NestJS', category: 'Backend' },

      // Databases
      { name: 'MySQL', category: 'Database' },
      { name: 'PostgreSQL', category: 'Database' },
      { name: 'MongoDB', category: 'Database' },
      { name: 'Redis', category: 'Database' },
      { name: 'SQLite', category: 'Database' },
      { name: 'Oracle', category: 'Database' },
      { name: 'SQL Server', category: 'Database' },
      { name: 'Elasticsearch', category: 'Database' },

      // Cloud & DevOps
      { name: 'AWS', category: 'Cloud & DevOps' },
      { name: 'Docker', category: 'Cloud & DevOps' },
      { name: 'Kubernetes', category: 'Cloud & DevOps' },
      { name: 'Git', category: 'Cloud & DevOps' },
      { name: 'Jenkins', category: 'Cloud & DevOps' },
      { name: 'Azure', category: 'Cloud & DevOps' },
      { name: 'GCP', category: 'Cloud & DevOps' },
      { name: 'Terraform', category: 'Cloud & DevOps' },

      // Data Science & AI
      { name: 'Machine Learning', category: 'Data Science & AI' },
      { name: 'Deep Learning', category: 'Data Science & AI' },
      { name: 'TensorFlow', category: 'Data Science & AI' },
      { name: 'PyTorch', category: 'Data Science & AI' },
      { name: 'Pandas', category: 'Data Science & AI' },
      { name: 'NumPy', category: 'Data Science & AI' },
      { name: 'Scikit-learn', category: 'Data Science & AI' },
      { name: 'R', category: 'Data Science & AI' },

      // Mobile Development
      { name: 'React Native', category: 'Mobile Development' },
      { name: 'Flutter', category: 'Mobile Development' },
      { name: 'iOS Development', category: 'Mobile Development' },
      { name: 'Android Development', category: 'Mobile Development' },
      { name: 'Swift', category: 'Mobile Development' },
      { name: 'Kotlin', category: 'Mobile Development' }
    ];

    for (const skill of skills) {
      await pool.execute(
        'INSERT INTO skills (name, category) VALUES (?, ?)',
        [skill.name, skill.category]
      );
    }

    // Insert sample users
    console.log('👥 Inserting sample users...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 12);

    const users = [
      {
        name: 'Nadine C',
        email: 'nadine@example.com',
        password_hash: hashedPassword,
        xp_total: 2450,
        streak_count: 10,
        title: 'Skill Explorer',
        study_time: 1920, // 32 hours in minutes
        random_image_id: 1
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password_hash: hashedPassword,
        xp_total: 3200,
        streak_count: 15,
        title: 'Advanced',
        study_time: 2400,
        random_image_id: 2
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password_hash: hashedPassword,
        xp_total: 1800,
        streak_count: 7,
        title: 'Intermediate',
        study_time: 1440,
        random_image_id: 3
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password_hash: hashedPassword,
        xp_total: 4500,
        streak_count: 25,
        title: 'Expert',
        study_time: 3600,
        random_image_id: 4
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        password_hash: hashedPassword,
        xp_total: 1200,
        streak_count: 5,
        title: 'Beginner+',
        study_time: 960,
        random_image_id: 5
      }
    ];

    for (const user of users) {
      await pool.execute(
        'INSERT INTO users (name, email, password_hash, xp_total, streak_count, title, study_time, random_image_id, last_active_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE())',
        [user.name, user.email, user.password_hash, user.xp_total, user.streak_count, user.title, user.study_time, user.random_image_id]
      );
    }

    // Insert sample jobs
    console.log('💼 Inserting sample jobs...');
    const jobs = [
      {
        title: 'Frontend Developer',
        company: 'TechCorp Indonesia',
        location: 'Jakarta',
        salary_min: 8000000,
        salary_max: 12000000,
        tags: JSON.stringify(['React', 'JavaScript', 'CSS', 'HTML']),
        description: 'We are looking for a skilled Frontend Developer to join our team. You will be responsible for building user interfaces and ensuring great user experience.',
        requirements: JSON.stringify(['React', 'JavaScript', 'CSS', 'HTML', 'Git']),
        is_remote: true,
        is_fulltime: true
      },
      {
        title: 'Fullstack Developer',
        company: 'StartupXYZ',
        location: 'Bandung',
        salary_min: 10000000,
        salary_max: 15000000,
        tags: JSON.stringify(['Node.js', 'React', 'MongoDB', 'JavaScript']),
        description: 'Join our dynamic team as a Fullstack Developer. You will work on both frontend and backend development using modern technologies.',
        requirements: JSON.stringify(['Node.js', 'React', 'MongoDB', 'JavaScript', 'Express.js']),
        is_remote: false,
        is_fulltime: true
      },
      {
        title: 'Data Scientist',
        company: 'DataCorp',
        location: 'Surabaya',
        salary_min: 12000000,
        salary_max: 18000000,
        tags: JSON.stringify(['Python', 'Machine Learning', 'Pandas', 'NumPy']),
        description: 'We are seeking a Data Scientist to analyze complex data and build machine learning models to drive business insights.',
        requirements: JSON.stringify(['Python', 'Machine Learning', 'Pandas', 'NumPy', 'SQL']),
        is_remote: true,
        is_fulltime: true
      },
      {
        title: 'Backend Developer',
        company: 'API Solutions',
        location: 'Yogyakarta',
        salary_min: 9000000,
        salary_max: 14000000,
        tags: JSON.stringify(['Python', 'Django', 'PostgreSQL', 'Docker']),
        description: 'Looking for a Backend Developer to build scalable APIs and microservices using Python and Django.',
        requirements: JSON.stringify(['Python', 'Django', 'PostgreSQL', 'Docker', 'AWS']),
        is_remote: true,
        is_fulltime: true
      },
      {
        title: 'Mobile Developer',
        company: 'AppStudio',
        location: 'Medan',
        salary_min: 7000000,
        salary_max: 11000000,
        tags: JSON.stringify(['React Native', 'JavaScript', 'iOS', 'Android']),
        description: 'Join our mobile development team to create amazing mobile applications using React Native.',
        requirements: JSON.stringify(['React Native', 'JavaScript', 'iOS', 'Android', 'Git']),
        is_remote: false,
        is_fulltime: true
      }
    ];

    for (const job of jobs) {
      await pool.execute(
        'INSERT INTO jobs (title, company, location, salary_min, salary_max, tags, description, requirements, is_remote, is_fulltime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [job.title, job.company, job.location, job.salary_min, job.salary_max, job.tags, job.description, job.requirements, job.is_remote, job.is_fulltime]
      );
    }

    // Insert roadmaps
    console.log('🗺️ Inserting roadmaps...');
    const roadmaps = [
      {
        title: 'Frontend Development',
        description: 'Learn modern frontend development with React, JavaScript, and CSS. Build responsive and interactive web applications.'
      },
      {
        title: 'Data Science',
        description: 'Master data science with Python, machine learning, and data analysis. Learn to extract insights from data.'
      },
      {
        title: 'Fullstack Development',
        description: 'Become a fullstack developer by learning both frontend and backend technologies. Build complete web applications.'
      },
      {
        title: 'Backend Development',
        description: 'Learn backend development with Node.js, databases, and APIs. Build scalable server-side applications.'
      }
    ];

    for (const roadmap of roadmaps) {
      await pool.execute(
        'INSERT INTO roadmaps (title, description) VALUES (?, ?)',
        [roadmap.title, roadmap.description]
      );
    }

    // Insert roadmap steps
    console.log('📝 Inserting roadmap steps...');
    const roadmapSteps = [
      // Frontend Development roadmap
      { roadmap_id: 1, title: 'HTML Fundamentals', order_index: 1, content: 'Learn the basics of HTML structure, elements, and semantic markup.' },
      { roadmap_id: 1, title: 'CSS Styling', order_index: 2, content: 'Master CSS for styling, layout, and responsive design.' },
      { roadmap_id: 1, title: 'JavaScript Basics', order_index: 3, content: 'Learn JavaScript fundamentals, variables, functions, and DOM manipulation.' },
      { roadmap_id: 1, title: 'React Introduction', order_index: 4, content: 'Get started with React, components, props, and state management.' },
      { roadmap_id: 1, title: 'React Advanced', order_index: 5, content: 'Learn advanced React concepts like hooks, context, and performance optimization.' },

      // Data Science roadmap
      { roadmap_id: 2, title: 'Python Basics', order_index: 1, content: 'Learn Python programming fundamentals and syntax.' },
      { roadmap_id: 2, title: 'Data Manipulation', order_index: 2, content: 'Master Pandas and NumPy for data manipulation and analysis.' },
      { roadmap_id: 2, title: 'Data Visualization', order_index: 3, content: 'Learn to create visualizations with Matplotlib and Seaborn.' },
      { roadmap_id: 2, title: 'Machine Learning', order_index: 4, content: 'Introduction to machine learning algorithms and Scikit-learn.' },
      { roadmap_id: 2, title: 'Deep Learning', order_index: 5, content: 'Explore deep learning with TensorFlow and PyTorch.' }
    ];

    for (const step of roadmapSteps) {
      await pool.execute(
        'INSERT INTO roadmap_steps (roadmap_id, title, order_index, content) VALUES (?, ?, ?, ?)',
        [step.roadmap_id, step.title, step.order_index, step.content]
      );
    }

    // Insert challenges
    console.log('🏆 Inserting challenges...');
    const challenges = [
      // Daily challenges
      { title: 'JavaScript Loops', type: 'daily', description: 'Kerjakan 5 soal tentang for & while loop.', xp_reward: 50 },
      { title: 'CSS Flexbox', type: 'daily', description: 'Buat layout responsive menggunakan CSS Flexbox.', xp_reward: 50 },
      { title: 'React Components', type: 'daily', description: 'Buat 3 komponen React dengan props dan state.', xp_reward: 50 },

      // Weekly challenges
      { title: 'Build a Todo App', type: 'weekly', description: 'Buat aplikasi todo list lengkap dengan CRUD operations.', xp_reward: 200 },
      { title: 'Data Analysis Project', type: 'weekly', description: 'Analisis dataset dan buat visualisasi yang menarik.', xp_reward: 200 },
      { title: 'API Integration', type: 'weekly', description: 'Integrasikan aplikasi dengan external API dan handle errors.', xp_reward: 200 },

      // Monthly challenges
      { title: 'Full Stack Project', type: 'monthly', description: 'Buat aplikasi full stack dengan frontend, backend, dan database.', xp_reward: 500 },
      { title: 'Machine Learning Model', type: 'monthly', description: 'Buat dan deploy machine learning model untuk prediksi.', xp_reward: 500 },
      { title: 'Open Source Contribution', type: 'monthly', description: 'Kontribusi ke proyek open source dan submit pull request.', xp_reward: 500 }
    ];

    for (const challenge of challenges) {
      await pool.execute(
        'INSERT INTO challenges (title, type, description, xp_reward) VALUES (?, ?, ?, ?)',
        [challenge.title, challenge.type, challenge.description, challenge.xp_reward]
      );
    }

    // Insert sample user skills
    console.log('🎯 Inserting user skills...');
    const userSkills = [
      { user_id: 1, skill_id: 1, level: 'intermediate' }, // Nadine - JavaScript
      { user_id: 1, skill_id: 11, level: 'beginner' },    // Nadine - React
      { user_id: 1, skill_id: 14, level: 'intermediate' }, // Nadine - HTML
      { user_id: 1, skill_id: 15, level: 'intermediate' }, // Nadine - CSS
      { user_id: 2, skill_id: 2, level: 'advanced' },     // John - Python
      { user_id: 2, skill_id: 21, level: 'advanced' },    // John - Node.js
      { user_id: 2, skill_id: 11, level: 'advanced' },    // John - React
      { user_id: 3, skill_id: 1, level: 'intermediate' }, // Jane - JavaScript
      { user_id: 3, skill_id: 11, level: 'beginner' },    // Jane - React
      { user_id: 4, skill_id: 2, level: 'expert' },       // Mike - Python
      { user_id: 4, skill_id: 31, level: 'expert' },      // Mike - Machine Learning
      { user_id: 4, skill_id: 35, level: 'advanced' },    // Mike - Pandas
      { user_id: 5, skill_id: 1, level: 'beginner' },     // Sarah - JavaScript
      { user_id: 5, skill_id: 14, level: 'beginner' },    // Sarah - HTML
      { user_id: 5, skill_id: 15, level: 'beginner' }     // Sarah - CSS
    ];

    for (const userSkill of userSkills) {
      await pool.execute(
        'INSERT INTO user_skills (user_id, skill_id, level) VALUES (?, ?, ?)',
        [userSkill.user_id, userSkill.skill_id, userSkill.level]
      );
    }

    // Insert sample activities
    console.log('📊 Inserting sample activities...');
    const activities = [
      { user_id: 1, type: 'quiz_complete', xp_earned: 20, meta: JSON.stringify({ quiz_id: 1, score: 85 }) },
      { user_id: 1, type: 'challenge_complete', xp_earned: 50, meta: JSON.stringify({ challenge_id: 1, score: 90 }) },
      { user_id: 1, type: 'cv_review', xp_earned: 15, meta: JSON.stringify({ cv_review_id: 1, score: 75 }) },
      { user_id: 1, type: 'streak_achieved', xp_earned: 20, meta: JSON.stringify({ streak_days: 7 }) },
      { user_id: 2, type: 'quiz_complete', xp_earned: 30, meta: JSON.stringify({ quiz_id: 2, score: 95 }) },
      { user_id: 2, type: 'challenge_complete', xp_earned: 200, meta: JSON.stringify({ challenge_id: 4, score: 88 }) },
      { user_id: 3, type: 'community_post', xp_earned: 5, meta: JSON.stringify({ post_id: 1 }) },
      { user_id: 4, type: 'quiz_complete', xp_earned: 30, meta: JSON.stringify({ quiz_id: 3, score: 100 }) },
      { user_id: 4, type: 'challenge_complete', xp_earned: 500, meta: JSON.stringify({ challenge_id: 7, score: 95 }) }
    ];

    for (const activity of activities) {
      await pool.execute(
        'INSERT INTO activities (user_id, type, xp_earned, meta) VALUES (?, ?, ?, ?)',
        [activity.user_id, activity.type, activity.xp_earned, activity.meta]
      );
    }

    // Insert sample community posts
    console.log('💬 Inserting community posts...');
    const posts = [
      {
        user_id: 1,
        content: 'Saya sedang belajar React di roadmap, tapi bingung bagian mana yang paling sering ditanya saat interview. Ada tips?',
        likes_count: 2
      },
      {
        user_id: 2,
        content: 'Baru selesai challenge build todo app! Rasanya puas banget bisa implementasi CRUD operations dengan React dan Node.js. Next target: belajar authentication!',
        likes_count: 5
      },
      {
        user_id: 3,
        content: 'Ada yang punya rekomendasi resource untuk belajar CSS Grid? Mau improve layout skills nih.',
        likes_count: 3
      },
      {
        user_id: 4,
        content: 'Sharing hasil analisis data sales dengan Python dan Pandas. Bisa lihat trend yang menarik! Data visualization is so powerful 🔥',
        likes_count: 8
      },
      {
        user_id: 5,
        content: 'First time posting here! Baru mulai belajar programming, excited untuk journey ini! 💪',
        likes_count: 1
      }
    ];

    for (const post of posts) {
      await pool.execute(
        'INSERT INTO community_posts (user_id, content, likes_count) VALUES (?, ?, ?)',
        [post.user_id, post.content, post.likes_count]
      );
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Seeded data:');
    console.log('   - Skills: ' + skills.length);
    console.log('   - Users: ' + users.length);
    console.log('   - Jobs: ' + jobs.length);
    console.log('   - Roadmaps: ' + roadmaps.length);
    console.log('   - Roadmap Steps: ' + roadmapSteps.length);
    console.log('   - Challenges: ' + challenges.length);
    console.log('   - User Skills: ' + userSkills.length);
    console.log('   - Activities: ' + activities.length);
    console.log('   - Community Posts: ' + posts.length);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('🎉 Seeding process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedData;
