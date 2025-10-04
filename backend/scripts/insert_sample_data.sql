-- Sample data untuk database Strive

-- Insert Avatar Images
INSERT INTO avatar_images (image_url) VALUES
('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'),
('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'),
('https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'),
('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'),
('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'),
('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'),
('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face');

-- Insert Skills
INSERT INTO skills (name, category) VALUES
('JavaScript', 'Programming Languages'),
('Python', 'Programming Languages'),
('Java', 'Programming Languages'),
('React', 'Web Development'),
('Vue.js', 'Web Development'),
('Node.js', 'Web Development'),
('HTML', 'Web Development'),
('CSS', 'Web Development'),
('MySQL', 'Database'),
('Machine Learning', 'Data Science'),
('Docker', 'DevOps'),
('Git', 'Version Control');

-- Insert Challenges
INSERT INTO challenges (title, type, description, xp_reward) VALUES
('JavaScript Loops', 'daily', 'Kerjakan 5 soal tentang for & while loop', 50),
('CSS Flexbox', 'daily', 'Buat layout responsive menggunakan Flexbox', 40),
('Python Basics', 'daily', 'Selesaikan 10 soal Python dasar', 60),
('Full Stack Project', 'weekly', 'Buat aplikasi web full stack dengan React dan Node.js', 300),
('Data Analysis', 'weekly', 'Analisis dataset dan buat visualisasi', 250),
('Open Source Contribution', 'monthly', 'Kontribusi ke proyek open source', 500);

-- Insert Courses
INSERT INTO courses (title, description, image_url, xp_reward) VALUES
('Full Stack Web Development', 'Pelajari pengembangan web dari frontend hingga backend dengan teknologi modern', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop', 1000),
('Data Science dengan Python', 'Kuasai analisis data dan machine learning menggunakan Python', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop', 1200),
('Mobile App Development', 'Buat aplikasi mobile cross-platform dengan React Native', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop', 900);

-- Insert Roadmaps
INSERT INTO roadmaps (title, description) VALUES
('Frontend Developer', 'Roadmap lengkap untuk menjadi Frontend Developer profesional'),
('Backend Developer', 'Panduan step-by-step menjadi Backend Developer'),
('Data Scientist', 'Jalur pembelajaran untuk menjadi Data Scientist');

-- Quiz akan di-generate secara dinamis oleh GROQ API
-- Tidak perlu data statis untuk quiz

-- Insert Roadmap Steps
INSERT INTO roadmap_steps (roadmap_id, title, order_index, content) VALUES
(1, 'HTML & CSS Fundamentals', 1, 'Pelajari dasar-dasar HTML dan CSS untuk membangun struktur dan styling website'),
(1, 'JavaScript Basics', 2, 'Kuasa JavaScript dasar termasuk variables, functions, dan DOM manipulation'),
(1, 'React Fundamentals', 3, 'Pelajari React untuk membangun user interface yang interaktif'),
(2, 'Programming Language', 1, 'Pilih dan kuasai bahasa pemrograman backend seperti Python, Java, atau Node.js'),
(2, 'Database Fundamentals', 2, 'Pelajari SQL dan database relasional seperti MySQL atau PostgreSQL'),
(3, 'Python Basics', 1, 'Pelajari Python untuk data science dan machine learning'),
(3, 'Data Analysis', 2, 'Pelajari analisis data dengan Pandas dan NumPy');

-- Insert Jobs
INSERT INTO jobs (title, company, location, salary_min, salary_max, tags, description, requirements, is_remote, is_fulltime) VALUES
('Frontend Developer', 'TechCorp Indonesia', 'Jakarta', 8000000, 12000000, '["React", "JavaScript", "CSS", "HTML"]', 'Kami mencari Frontend Developer yang berpengalaman untuk bergabung dengan tim development kami.', '["Minimal 2 tahun pengalaman", "Menguasai React dan JavaScript", "Familiar dengan CSS dan HTML"]', 1, 1),
('Backend Developer', 'StartupXYZ', 'Bandung', 10000000, 15000000, '["Node.js", "Python", "MySQL", "API"]', 'Bergabunglah dengan tim backend kami untuk mengembangkan aplikasi web yang scalable.', '["Minimal 3 tahun pengalaman", "Menguasai Node.js atau Python", "Familiar dengan database MySQL/PostgreSQL"]', 1, 1),
('Data Scientist', 'DataCorp', 'Surabaya', 12000000, 18000000, '["Python", "Machine Learning", "SQL", "Statistics"]', 'Kami mencari Data Scientist untuk menganalisis data dan membangun model machine learning.', '["Minimal 2 tahun pengalaman", "Menguasai Python dan library data science", "Memahami machine learning algorithms"]', 0, 1);

-- Insert Sample Users
INSERT INTO users (email, password_hash, name, avatar_url, random_image_id, xp_total, streak_count, last_active_date, title, study_time) VALUES
('arya@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Arya Pratama', NULL, 1, 2450, 7, '2024-01-15', 'Intermediate', 32),
('sari@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sari Dewi', NULL, 2, 3200, 12, '2024-01-15', 'Advanced', 45),
('budi@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Budi Santoso', NULL, 3, 1800, 5, '2024-01-14', 'Beginner', 28),
('rina@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Rina Sari', NULL, 4, 4850, 15, '2024-01-15', 'Expert', 68),
('david@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'David Wijaya', NULL, 5, 4200, 8, '2024-01-15', 'Advanced', 52),
('maya@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Maya Putri', NULL, 6, 3600, 20, '2024-01-15', 'Advanced', 41),
('tono@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Tono Susanto', NULL, 7, 2800, 6, '2024-01-14', 'Intermediate', 35),
('lina@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lina Kurnia', NULL, 1, 1950, 4, '2024-01-14', 'Beginner', 22),
('agus@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Agus Prasetyo', NULL, 2, 3200, 11, '2024-01-15', 'Advanced', 48),
('nina@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nina Rahayu', NULL, 3, 2100, 3, '2024-01-13', 'Beginner', 29);

-- Insert User Skills
INSERT INTO user_skills (user_id, skill_id, level) VALUES
(1, 1, 'intermediate'), -- Arya - JavaScript
(1, 4, 'intermediate'), -- Arya - React
(1, 7, 'beginner'), -- Arya - HTML
(1, 8, 'intermediate'), -- Arya - CSS
(2, 2, 'advanced'), -- Sari - Python
(2, 10, 'intermediate'), -- Sari - Machine Learning
(3, 1, 'beginner'), -- Budi - JavaScript
(3, 7, 'beginner'), -- Budi - HTML
(4, 1, 'expert'), -- Rina - JavaScript
(4, 4, 'expert'), -- Rina - React
(4, 6, 'advanced'), -- Rina - Node.js
(4, 9, 'advanced'), -- Rina - MySQL
(5, 2, 'expert'), -- David - Python
(5, 10, 'expert'), -- David - Machine Learning
(5, 11, 'advanced'), -- David - Docker
(6, 1, 'advanced'), -- Maya - JavaScript
(6, 4, 'advanced'), -- Maya - React
(6, 5, 'intermediate'), -- Maya - Vue.js
(7, 1, 'intermediate'), -- Tono - JavaScript
(7, 6, 'intermediate'), -- Tono - Node.js
(8, 7, 'beginner'), -- Lina - HTML
(8, 8, 'beginner'), -- Lina - CSS
(9, 2, 'advanced'), -- Agus - Python
(9, 10, 'advanced'), -- Agus - Machine Learning
(10, 1, 'beginner'), -- Nina - JavaScript
(10, 7, 'beginner'); -- Nina - HTML

-- Insert Activities
INSERT INTO activities (user_id, type, meta, xp_earned, created_at) VALUES
(1, 'quiz_complete', '{"quiz_title": "JavaScript Basics", "score": 85}', 50, '2024-01-15 10:30:00'),
(1, 'challenge_complete', '{"challenge_title": "JavaScript Loops", "challenge_type": "daily"}', 50, '2024-01-15 14:20:00'),
(1, 'skill_added', '{"skill_name": "React", "skill_level": "intermediate"}', 30, '2024-01-14 16:45:00'),
(2, 'quiz_complete', '{"quiz_title": "Python Data Analysis", "score": 92}', 60, '2024-01-15 11:15:00'),
(2, 'challenge_complete', '{"challenge_title": "Data Analysis", "challenge_type": "weekly"}', 250, '2024-01-14 15:30:00'),
(3, 'quiz_complete', '{"quiz_title": "HTML Fundamentals", "score": 78}', 40, '2024-01-14 12:00:00'),
(4, 'quiz_complete', '{"quiz_title": "Advanced React Patterns", "score": 96}', 80, '2024-01-15 09:00:00'),
(4, 'challenge_complete', '{"challenge_title": "Full Stack Project", "challenge_type": "weekly"}', 300, '2024-01-14 18:00:00'),
(4, 'skill_added', '{"skill_name": "Node.js", "skill_level": "advanced"}', 50, '2024-01-13 14:30:00'),
(5, 'quiz_complete', '{"quiz_title": "Machine Learning Fundamentals", "score": 94}', 70, '2024-01-15 08:30:00'),
(5, 'challenge_complete', '{"challenge_title": "Data Analysis", "challenge_type": "weekly"}', 250, '2024-01-13 16:45:00'),
(6, 'quiz_complete', '{"quiz_title": "Vue.js Components", "score": 88}', 60, '2024-01-15 11:00:00'),
(6, 'challenge_complete', '{"challenge_title": "CSS Flexbox", "challenge_type": "daily"}', 40, '2024-01-15 15:20:00'),
(7, 'quiz_complete', '{"quiz_title": "Node.js Async Programming", "score": 82}', 55, '2024-01-14 13:15:00'),
(8, 'quiz_complete', '{"quiz_title": "CSS Grid Layout", "score": 75}', 45, '2024-01-14 10:45:00'),
(9, 'quiz_complete', '{"quiz_title": "Python Advanced Topics", "score": 90}', 65, '2024-01-15 12:30:00'),
(10, 'quiz_complete', '{"quiz_title": "JavaScript DOM Manipulation", "score": 70}', 40, '2024-01-13 14:00:00');

-- Insert Community Posts
INSERT INTO community_posts (user_id, content, image_url, likes_count, created_at) VALUES
(1, 'Saya sedang belajar React di roadmap, tapi bingung bagian mana yang paling sering ditanya saat interview. Ada tips?', NULL, 2, '2024-01-15 10:30:00'),
(2, 'Baru selesai project data analysis dengan Python! Hasilnya cukup memuaskan. Ada yang mau diskusi tentang machine learning?', NULL, 5, '2024-01-15 11:15:00'),
(3, 'Hari ini belajar HTML dan CSS dasar. Masih bingung dengan positioning, tapi semangat terus! 💪', NULL, 3, '2024-01-14 12:00:00'),
(4, 'Just completed a full-stack project using React and Node.js! The learning curve was steep but totally worth it. Sharing my experience in the comments!', NULL, 8, '2024-01-15 09:30:00'),
(5, 'Machine learning is fascinating! Just built my first neural network. Anyone else working on ML projects? Let''s share resources!', NULL, 6, '2024-01-15 08:45:00'),
(6, 'Vue.js vs React - which one should I focus on for my next project? Both seem powerful but I want to master one first.', NULL, 4, '2024-01-15 11:20:00'),
(7, 'Node.js async programming can be tricky at first, but once you get the hang of it, it''s really powerful!', NULL, 3, '2024-01-14 13:30:00'),
(8, 'CSS Grid is a game changer! Finally understanding how to create complex layouts easily.', NULL, 2, '2024-01-14 11:00:00'),
(9, 'Python for data science is amazing! The pandas library makes data manipulation so much easier.', NULL, 5, '2024-01-15 12:45:00'),
(10, 'DOM manipulation with vanilla JavaScript is still relevant! Don''t skip the fundamentals.', NULL, 1, '2024-01-13 14:15:00');

-- Insert User Challenges
INSERT INTO user_challenges (user_id, challenge_id, status, score, completed_at, created_at) VALUES
(1, 1, 'completed', 85, '2024-01-15 14:20:00', '2024-01-15 10:00:00'),
(1, 2, 'completed', 90, '2024-01-14 16:30:00', '2024-01-14 14:00:00'),
(2, 5, 'completed', 95, '2024-01-14 15:30:00', '2024-01-12 10:00:00'),
(3, 1, 'completed', 75, '2024-01-14 12:30:00', '2024-01-14 10:00:00'),
(4, 4, 'completed', 98, '2024-01-14 18:00:00', '2024-01-10 09:00:00'),
(4, 1, 'completed', 92, '2024-01-13 15:00:00', '2024-01-13 10:00:00'),
(5, 5, 'completed', 96, '2024-01-13 16:45:00', '2024-01-11 10:00:00'),
(5, 2, 'completed', 88, '2024-01-12 14:00:00', '2024-01-12 10:00:00'),
(6, 2, 'completed', 87, '2024-01-15 15:20:00', '2024-01-15 10:00:00'),
(6, 3, 'completed', 89, '2024-01-14 11:00:00', '2024-01-14 09:00:00'),
(7, 1, 'completed', 82, '2024-01-13 16:00:00', '2024-01-13 10:00:00'),
(8, 2, 'completed', 78, '2024-01-12 15:00:00', '2024-01-12 10:00:00'),
(9, 5, 'completed', 91, '2024-01-14 17:00:00', '2024-01-12 10:00:00'),
(10, 1, 'completed', 70, '2024-01-13 15:30:00', '2024-01-13 10:00:00');

-- Insert User Roadmap Progress
INSERT INTO user_roadmap_progress (user_id, roadmap_id, step_id, completed, completed_at, created_at) VALUES
(1, 1, 1, 1, '2024-01-10 10:00:00', '2024-01-08 09:00:00'),
(1, 1, 2, 1, '2024-01-12 14:30:00', '2024-01-10 10:00:00'),
(1, 1, 3, 0, NULL, '2024-01-15 10:00:00'),
(2, 3, 1, 1, '2024-01-08 11:00:00', '2024-01-05 09:00:00'),
(2, 3, 2, 0, NULL, '2024-01-15 11:00:00'),
(3, 1, 1, 1, '2024-01-12 12:00:00', '2024-01-10 10:00:00'),
(3, 1, 2, 0, NULL, '2024-01-14 12:00:00');

-- Insert User XP History
INSERT INTO user_xp_history (user_id, source_type, source_id, xp_amount, created_at) VALUES
(1, 'quiz', 1, 50, '2024-01-15 10:30:00'),
(1, 'challenge', 1, 50, '2024-01-15 14:20:00'),
(1, 'skill_added', 4, 30, '2024-01-14 16:45:00'),
(2, 'quiz', 2, 60, '2024-01-15 11:15:00'),
(2, 'challenge', 5, 250, '2024-01-14 15:30:00'),
(3, 'quiz', 3, 40, '2024-01-14 12:00:00'),
(4, 'quiz', 4, 80, '2024-01-15 09:00:00'),
(4, 'challenge', 4, 300, '2024-01-14 18:00:00'),
(4, 'skill_added', 6, 50, '2024-01-13 14:30:00'),
(5, 'quiz', 5, 70, '2024-01-15 08:30:00'),
(5, 'challenge', 5, 250, '2024-01-13 16:45:00'),
(6, 'quiz', 6, 60, '2024-01-15 11:00:00'),
(6, 'challenge', 2, 40, '2024-01-15 15:20:00'),
(7, 'quiz', 7, 55, '2024-01-14 13:15:00'),
(8, 'quiz', 8, 45, '2024-01-14 10:45:00'),
(9, 'quiz', 9, 65, '2024-01-15 12:30:00'),
(10, 'quiz', 10, 40, '2024-01-13 14:00:00');
