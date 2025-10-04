-- Clear existing challenges first
DELETE FROM challenges;

-- Insert Daily Challenges
INSERT INTO challenges (title, type, description, xp_reward, created_at) VALUES
('JavaScript Loops', 'daily', 'Kerjakan 5 soal tentang for & while loop. Buatlah fungsi yang menggunakan loop untuk menghitung jumlah angka genap dari 1 sampai 100.', 50, NOW());

INSERT INTO challenges (title, type, description, xp_reward, created_at) VALUES
('Array Manipulation', 'daily', 'Buatlah fungsi untuk mencari elemen terbesar dalam array. Fungsi harus menerima array angka dan mengembalikan nilai terbesar.', 50, NOW());

INSERT INTO challenges (title, type, description, xp_reward, created_at) VALUES
('String Reversal', 'daily', 'Buatlah fungsi untuk membalik string. Fungsi harus menerima string dan mengembalikan string yang dibalik.', 50, NOW());

-- Insert Weekly Challenges
INSERT INTO challenges (title, type, description, xp_reward, created_at) VALUES
('Data Structure: Stack', 'weekly', 'Implementasikan struktur data Stack dengan operasi push, pop, dan peek. Stack harus menggunakan array sebagai penyimpanan internal.', 150, NOW());

INSERT INTO challenges (title, type, description, xp_reward, created_at) VALUES
('Algorithm: Binary Search', 'weekly', 'Implementasikan algoritma binary search untuk mencari elemen dalam array yang sudah diurutkan. Fungsi harus mengembalikan index elemen atau -1 jika tidak ditemukan.', 150, NOW());

INSERT INTO challenges (title, type, description, xp_reward, created_at) VALUES
('Async Programming', 'weekly', 'Buatlah fungsi async yang mengambil data dari API dan memprosesnya. Gunakan fetch API dan handle error dengan try-catch.', 150, NOW());

-- Insert Monthly Challenges
INSERT INTO challenges (title, type, description, xp_reward, created_at) VALUES
('Full Stack: Todo App', 'monthly', 'Buatlah aplikasi Todo lengkap dengan CRUD operations. Implementasikan class TodoManager dengan method untuk create, read, update, dan delete todo.', 500, NOW());

INSERT INTO challenges (title, type, description, xp_reward, created_at) VALUES
('Algorithm: Path Finding', 'monthly', 'Implementasikan algoritma path finding menggunakan BFS (Breadth-First Search) untuk mencari jalur terpendek dalam grid 2D.', 500, NOW());

INSERT INTO challenges (title, type, description, xp_reward, created_at) VALUES
('System Design: Cache Implementation', 'monthly', 'Implementasikan LRU (Least Recently Used) Cache dengan operasi get dan put. Cache harus memiliki kapasitas maksimal dan mengganti elemen yang paling lama tidak digunakan.', 500, NOW());
