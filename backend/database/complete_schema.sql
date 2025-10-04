-- Complete Database Schema for Strive Platform
-- Drop existing tables if they exist (for clean setup)
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS user_xp_history;
DROP TABLE IF EXISTS post_comments;
DROP TABLE IF EXISTS post_likes;
DROP TABLE IF EXISTS community_posts;
DROP TABLE IF EXISTS cv_reviews;
DROP TABLE IF EXISTS user_challenges;
DROP TABLE IF EXISTS challenges;
DROP TABLE IF EXISTS user_roadmap_progress;
DROP TABLE IF EXISTS roadmap_steps;
DROP TABLE IF EXISTS roadmaps;
DROP TABLE IF EXISTS job_recommendations;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS user_skills;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS avatar_images;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    random_image_id INT,
    xp_total INT DEFAULT 0,
    streak_count INT DEFAULT 0,
    last_active_date DATE,
    title VARCHAR(100) DEFAULT 'Beginner',
    study_time INT DEFAULT 0, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_xp_total (xp_total),
    INDEX idx_streak_count (streak_count)
);

-- Avatar images pool
CREATE TABLE avatar_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills table
CREATE TABLE skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category)
);

-- User skills junction table
CREATE TABLE user_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_id INT NOT NULL,
    level ENUM('beginner', 'intermediate', 'advanced', 'expert') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_skill (user_id, skill_id),
    INDEX idx_user_id (user_id),
    INDEX idx_skill_id (skill_id)
);

-- Jobs table
CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    salary_min INT,
    salary_max INT,
    tags JSON,
    description TEXT,
    requirements JSON,
    is_remote BOOLEAN DEFAULT FALSE,
    is_fulltime BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_title (title),
    INDEX idx_company (company),
    INDEX idx_location (location),
    INDEX idx_salary_min (salary_min),
    INDEX idx_salary_max (salary_max)
);

-- Job recommendations table
CREATE TABLE job_recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    job_id INT NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_job_id (job_id),
    INDEX idx_score (score)
);

-- Courses table
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    xp_reward INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_title (title),
    INDEX idx_xp_reward (xp_reward)
);

-- Roadmaps table
CREATE TABLE roadmaps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_title (title)
);

-- Roadmap steps table
CREATE TABLE roadmap_steps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roadmap_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    order_index INT NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE,
    INDEX idx_roadmap_id (roadmap_id),
    INDEX idx_order_index (order_index)
);

-- Quiz akan di-generate secara dinamis oleh GROQ API
-- Tidak perlu tabel quizzes

-- User roadmap progress table
CREATE TABLE user_roadmap_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    roadmap_id INT NOT NULL,
    step_id INT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE,
    FOREIGN KEY (step_id) REFERENCES roadmap_steps(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_step (user_id, step_id),
    INDEX idx_user_id (user_id),
    INDEX idx_roadmap_id (roadmap_id),
    INDEX idx_step_id (step_id)
);

-- Challenges table
CREATE TABLE challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type ENUM('daily', 'weekly', 'monthly') NOT NULL,
    description TEXT,
    xp_reward INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_xp_reward (xp_reward)
);

-- User challenges table
CREATE TABLE user_challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    challenge_id INT NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed', 'failed') DEFAULT 'not_started',
    score INT,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_challenge_id (challenge_id),
    INDEX idx_status (status)
);

-- Activities table
CREATE TABLE activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('quiz_complete', 'challenge_complete', 'cv_review', 'streak_achieved', 'community_post', 'rank_change', 'skill_added', 'course_complete') NOT NULL,
    meta JSON,
    xp_earned INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
);

-- CV reviews table
CREATE TABLE cv_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    status ENUM('processing', 'completed', 'failed') DEFAULT 'processing',
    result JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- Community posts table
CREATE TABLE community_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(500),
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_likes_count (likes_count)
);

-- Post likes table
CREATE TABLE post_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_post_like (user_id, post_id),
    INDEX idx_user_id (user_id),
    INDEX idx_post_id (post_id)
);

-- Post comments table
CREATE TABLE post_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_post_id (post_id),
    INDEX idx_created_at (created_at)
);

-- User XP history table
CREATE TABLE user_xp_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    source_type ENUM('quiz', 'challenge', 'cv_review', 'streak', 'community_post', 'skill_added', 'course_complete') NOT NULL,
    source_id INT,
    xp_amount INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_source_type (source_type),
    INDEX idx_created_at (created_at)
);

-- Insert default avatar images
INSERT INTO avatar_images (image_url) VALUES
('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'),
('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'),
('https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'),
('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'),
('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'),
('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'),
('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face');

-- Insert default skills
INSERT INTO skills (name, category) VALUES
-- Programming Languages
('JavaScript', 'Programming Languages'),
('Python', 'Programming Languages'),
('Java', 'Programming Languages'),
('TypeScript', 'Programming Languages'),
('C++', 'Programming Languages'),
('C#', 'Programming Languages'),
('Go', 'Programming Languages'),
('Rust', 'Programming Languages'),
('PHP', 'Programming Languages'),
('Ruby', 'Programming Languages'),

-- Web Development
('React', 'Web Development'),
('Vue.js', 'Web Development'),
('Angular', 'Web Development'),
('Node.js', 'Web Development'),
('Express.js', 'Web Development'),
('Next.js', 'Web Development'),
('Nuxt.js', 'Web Development'),
('HTML', 'Web Development'),
('CSS', 'Web Development'),
('Sass', 'Web Development'),
('Tailwind CSS', 'Web Development'),
('Bootstrap', 'Web Development'),

-- Database
('MySQL', 'Database'),
('PostgreSQL', 'Database'),
('MongoDB', 'Database'),
('Redis', 'Database'),
('SQLite', 'Database'),
('Oracle', 'Database'),
('SQL Server', 'Database'),

-- DevOps & Tools
('Docker', 'DevOps'),
('Kubernetes', 'DevOps'),
('AWS', 'DevOps'),
('Azure', 'DevOps'),
('Google Cloud', 'DevOps'),
('Git', 'DevOps'),
('Jenkins', 'DevOps'),
('CI/CD', 'DevOps'),

-- Data Science
('Machine Learning', 'Data Science'),
('Deep Learning', 'Data Science'),
('TensorFlow', 'Data Science'),
('PyTorch', 'Data Science'),
('Pandas', 'Data Science'),
('NumPy', 'Data Science'),
('Scikit-learn', 'Data Science'),
('R', 'Data Science'),
('Tableau', 'Data Science'),
('Power BI', 'Data Science'),

-- Mobile Development
('React Native', 'Mobile Development'),
('Flutter', 'Mobile Development'),
('iOS Development', 'Mobile Development'),
('Android Development', 'Mobile Development'),
('Swift', 'Mobile Development'),
('Kotlin', 'Mobile Development');

-- Insert default roadmaps
INSERT INTO roadmaps (title, description) VALUES
('Full Stack Web Development', 'Complete roadmap to become a full stack web developer'),
('Data Science', 'Learn data science from basics to advanced topics'),
('Mobile App Development', 'Build mobile applications for iOS and Android'),
('DevOps Engineering', 'Master DevOps practices and tools'),
('Machine Learning', 'Deep dive into machine learning and AI'),
('Frontend Development', 'Specialize in frontend technologies and frameworks'),
('Backend Development', 'Focus on server-side development and APIs');

-- Insert default roadmap steps for Full Stack Web Development
INSERT INTO roadmap_steps (roadmap_id, title, order_index, content) VALUES
(1, 'HTML & CSS Fundamentals', 1, 'Learn the basics of HTML structure and CSS styling'),
(1, 'JavaScript Basics', 2, 'Master JavaScript fundamentals including variables, functions, and DOM manipulation'),
(1, 'Responsive Design', 3, 'Learn to create responsive layouts with CSS Grid and Flexbox'),
(1, 'Version Control with Git', 4, 'Understand Git workflow and collaboration'),
(1, 'React Fundamentals', 5, 'Build interactive user interfaces with React'),
(1, 'State Management', 6, 'Learn Redux and Context API for state management'),
(1, 'Backend with Node.js', 7, 'Create server-side applications with Node.js and Express'),
(1, 'Database Design', 8, 'Design and implement databases with SQL and NoSQL'),
(1, 'API Development', 9, 'Build RESTful APIs and GraphQL endpoints'),
(1, 'Authentication & Security', 10, 'Implement secure authentication and authorization'),
(1, 'Testing', 11, 'Write unit tests and integration tests'),
(1, 'Deployment', 12, 'Deploy applications to cloud platforms');

-- Insert default challenges
INSERT INTO challenges (title, type, description, xp_reward) VALUES
('JavaScript Loops', 'daily', 'Complete 5 JavaScript loop exercises', 50),
('CSS Flexbox Challenge', 'daily', 'Create a responsive layout using Flexbox', 40),
('Python Basics', 'daily', 'Solve 10 Python programming problems', 60),
('React Component', 'daily', 'Build a reusable React component', 70),
('SQL Queries', 'daily', 'Write 5 complex SQL queries', 50),
('Full Stack Project', 'weekly', 'Build a complete full stack application', 300),
('Data Analysis Project', 'weekly', 'Analyze a dataset and create visualizations', 250),
('Mobile App', 'weekly', 'Create a mobile application', 400),
('Open Source Contribution', 'monthly', 'Contribute to an open source project', 500),
('Algorithm Challenge', 'monthly', 'Solve advanced algorithm problems', 600);

-- Insert sample jobs
INSERT INTO jobs (title, company, location, salary_min, salary_max, tags, description, requirements, is_remote, is_fulltime) VALUES
('Frontend Developer', 'TechCorp Indonesia', 'Jakarta', 8000000, 12000000, '["React", "JavaScript", "CSS", "HTML"]', 'We are looking for a skilled Frontend Developer to join our development team.', '["2+ years experience", "Proficient in React and JavaScript", "Experience with CSS and HTML"]', TRUE, TRUE),
('Backend Developer', 'StartupXYZ', 'Bandung', 10000000, 15000000, '["Node.js", "Python", "MySQL", "API"]', 'Join our backend team to develop scalable web applications.', '["3+ years experience", "Expert in Node.js or Python", "Database experience"]', TRUE, TRUE),
('Data Scientist', 'DataCorp', 'Surabaya', 12000000, 18000000, '["Python", "Machine Learning", "SQL", "Statistics"]', 'Analyze data and build machine learning models.', '["2+ years experience", "Python and ML libraries", "Statistical knowledge"]', FALSE, TRUE),
('Full Stack Developer', 'InnovateTech', 'Yogyakarta', 9000000, 14000000, '["React", "Node.js", "MongoDB", "AWS"]', 'Develop end-to-end web applications.', '["3+ years experience", "Full stack development", "Cloud experience"]', TRUE, TRUE),
('DevOps Engineer', 'CloudSolutions', 'Medan', 11000000, 16000000, '["Docker", "Kubernetes", "AWS", "CI/CD"]', 'Manage infrastructure and deployment pipelines.', '["2+ years experience", "Containerization", "Cloud platforms"]', TRUE, TRUE);

-- Insert sample courses
INSERT INTO courses (title, description, image_url, xp_reward) VALUES
('Complete Web Development Bootcamp', 'Learn full stack web development from scratch', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop', 1000),
('Data Science with Python', 'Master data science using Python and popular libraries', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop', 1200),
('Mobile App Development', 'Build cross-platform mobile apps with React Native', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop', 900),
('Machine Learning Fundamentals', 'Introduction to machine learning algorithms and applications', 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop', 1100),
('DevOps and Cloud Computing', 'Learn DevOps practices and cloud deployment', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop', 800);

