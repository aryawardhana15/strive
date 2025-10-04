-- Insert sample challenges data
-- Clear existing challenges first
DELETE FROM challenges;

-- Daily Challenges
INSERT INTO challenges (title, type, description, xp_reward, language, code_template, requirements, examples, test_cases, created_at) VALUES
('JavaScript Loops', 'daily', 'Kerjakan 5 soal tentang for & while loop. Buatlah fungsi yang menggunakan loop untuk menghitung jumlah angka genap dari 1 sampai 100.', 50, 'javascript', 
'function countEvenNumbers() {
  // Tulis kode Anda di sini
  // Gunakan loop untuk menghitung angka genap dari 1 sampai 100
  // Return jumlah angka genap
}', 
'["Gunakan loop for atau while", "Hitung angka genap dari 1 sampai 100", "Return jumlah total angka genap"]',
'[{"input": "countEvenNumbers()", "output": "50"}]',
'[{"test_case": "Basic functionality", "input": "countEvenNumbers()", "expected_output": "50"}]',
NOW()),

('Array Manipulation', 'daily', 'Buatlah fungsi untuk mencari elemen terbesar dalam array. Fungsi harus menerima array angka dan mengembalikan nilai terbesar.', 50, 'javascript',
'function findMaxNumber(arr) {
  // Tulis kode Anda di sini
  // Cari angka terbesar dalam array
  // Return angka terbesar
}',
'["Menerima parameter array angka", "Menggunakan loop untuk mencari nilai terbesar", "Return nilai terbesar"]',
'[{"input": "findMaxNumber([1, 5, 3, 9, 2])", "output": "9"}]',
'[{"test_case": "Basic functionality", "input": "findMaxNumber([1, 5, 3, 9, 2])", "expected_output": "9"}]',
NOW()),

('String Reversal', 'daily', 'Buatlah fungsi untuk membalik string. Fungsi harus menerima string dan mengembalikan string yang dibalik.', 50, 'javascript',
'function reverseString(str) {
  // Tulis kode Anda di sini
  // Balik string yang diberikan
  // Return string yang sudah dibalik
}',
'["Menerima parameter string", "Membalik urutan karakter", "Return string yang dibalik"]',
'[{"input": "reverseString(\"hello\")", "output": "\"olleh\""}]',
'[{"test_case": "Basic functionality", "input": "reverseString(\"hello\")", "expected_output": "\"olleh\""}]',
NOW()),

-- Weekly Challenges
('Data Structure: Stack', 'weekly', 'Implementasikan struktur data Stack dengan operasi push, pop, dan peek. Stack harus menggunakan array sebagai penyimpanan internal.', 150, 'javascript',
'class Stack {
  constructor() {
    // Inisialisasi array untuk menyimpan data
  }
  
  push(item) {
    // Implementasi push
  }
  
  pop() {
    // Implementasi pop
  }
  
  peek() {
    // Implementasi peek
  }
  
  isEmpty() {
    // Implementasi isEmpty
  }
}',
'["Implementasikan class Stack", "Method push untuk menambah elemen", "Method pop untuk menghapus elemen", "Method peek untuk melihat elemen teratas", "Method isEmpty untuk cek apakah kosong"]',
'[{"input": "const stack = new Stack(); stack.push(1); stack.push(2); stack.peek();", "output": "2"}]',
'[{"test_case": "Basic stack operations", "input": "const stack = new Stack(); stack.push(1); stack.push(2); stack.peek();", "expected_output": "2"}]',
NOW()),

('Algorithm: Binary Search', 'weekly', 'Implementasikan algoritma binary search untuk mencari elemen dalam array yang sudah diurutkan. Fungsi harus mengembalikan index elemen atau -1 jika tidak ditemukan.', 150, 'javascript',
'function binarySearch(arr, target) {
  // Tulis kode Anda di sini
  // Implementasikan binary search
  // Return index jika ditemukan, -1 jika tidak
}',
'["Array sudah diurutkan (ascending)", "Menggunakan binary search algorithm", "Return index elemen jika ditemukan", "Return -1 jika tidak ditemukan"]',
'[{"input": "binarySearch([1, 3, 5, 7, 9], 5)", "output": "2"}]',
'[{"test_case": "Element found", "input": "binarySearch([1, 3, 5, 7, 9], 5)", "expected_output": "2"}]',
NOW()),

('Async Programming', 'weekly', 'Buatlah fungsi async yang mengambil data dari API dan memprosesnya. Gunakan fetch API dan handle error dengan try-catch.', 150, 'javascript',
'async function fetchUserData(userId) {
  // Tulis kode Anda di sini
  // Gunakan fetch untuk mengambil data user
  // Handle error dengan try-catch
  // Return data user atau null jika error
}',
'["Gunakan async/await", "Gunakan fetch API", "Handle error dengan try-catch", "Return data atau null"]',
'[{"input": "fetchUserData(1)", "output": "Promise yang resolve dengan data user"}]',
'[{"test_case": "Successful fetch", "input": "fetchUserData(1)", "expected_output": "Promise resolved with user data"}]',
NOW()),

-- Monthly Challenges
('Full Stack: Todo App', 'monthly', 'Buatlah aplikasi Todo lengkap dengan CRUD operations. Implementasikan class TodoManager dengan method untuk create, read, update, dan delete todo.', 500, 'javascript',
'class TodoManager {
  constructor() {
    // Inisialisasi array untuk menyimpan todos
  }
  
  createTodo(title, description) {
    // Implementasi create todo
  }
  
  getAllTodos() {
    // Implementasi get all todos
  }
  
  updateTodo(id, updates) {
    // Implementasi update todo
  }
  
  deleteTodo(id) {
    // Implementasi delete todo
  }
  
  toggleComplete(id) {
    // Implementasi toggle complete status
  }
}',
'["Implementasikan class TodoManager", "Method createTodo untuk membuat todo baru", "Method getAllTodos untuk mengambil semua todo", "Method updateTodo untuk mengupdate todo", "Method deleteTodo untuk menghapus todo", "Method toggleComplete untuk toggle status"]',
'[{"input": "const manager = new TodoManager(); manager.createTodo(\"Learn JS\", \"Study JavaScript basics\");", "output": "Todo object dengan id, title, description, completed: false"}]',
'[{"test_case": "Create and retrieve todo", "input": "const manager = new TodoManager(); manager.createTodo(\"Test\", \"Test todo\"); manager.getAllTodos();", "expected_output": "Array dengan 1 todo object"}]',
NOW()),

('Algorithm: Path Finding', 'monthly', 'Implementasikan algoritma path finding menggunakan BFS (Breadth-First Search) untuk mencari jalur terpendek dalam grid 2D.', 500, 'javascript',
'function findShortestPath(grid, start, end) {
  // Tulis kode Anda di sini
  // Implementasikan BFS untuk mencari jalur terpendek
  // Return array koordinat jalur atau null jika tidak ada jalur
}',
'["Grid adalah array 2D dengan 0 (path) dan 1 (obstacle)", "Start dan end adalah koordinat [row, col]", "Menggunakan BFS algorithm", "Return array koordinat jalur terpendek", "Return null jika tidak ada jalur"]',
'[{"input": "findShortestPath([[0,0,0],[0,1,0],[0,0,0]], [0,0], [2,2])", "output": "[[0,0], [0,1], [0,2], [1,2], [2,2]]"}]',
'[{"test_case": "Simple path finding", "input": "findShortestPath([[0,0,0],[0,1,0],[0,0,0]], [0,0], [2,2])", "expected_output": "Array koordinat jalur terpendek"}]',
NOW()),

('System Design: Cache Implementation', 'monthly', 'Implementasikan LRU (Least Recently Used) Cache dengan operasi get dan put. Cache harus memiliki kapasitas maksimal dan mengganti elemen yang paling lama tidak digunakan.', 500, 'javascript',
'class LRUCache {
  constructor(capacity) {
    // Inisialisasi cache dengan kapasitas
  }
  
  get(key) {
    // Implementasi get dengan LRU logic
  }
  
  put(key, value) {
    // Implementasi put dengan LRU logic
  }
}',
'["Constructor menerima parameter capacity", "Method get untuk mengambil value berdasarkan key", "Method put untuk menyimpan key-value pair", "Implementasi LRU replacement policy", "Update order saat get dan put"]',
'[{"input": "const cache = new LRUCache(2); cache.put(1, 1); cache.put(2, 2); cache.get(1);", "output": "1"}]',
'[{"test_case": "Basic LRU operations", "input": "const cache = new LRUCache(2); cache.put(1, 1); cache.put(2, 2); cache.get(1);", "expected_output": "1"}]',
NOW());

-- Show summary
SELECT 
  type,
  COUNT(*) as count,
  SUM(xp_reward) as total_xp
FROM challenges 
GROUP BY type 
ORDER BY 
  CASE type 
    WHEN 'daily' THEN 1 
    WHEN 'weekly' THEN 2 
    WHEN 'monthly' THEN 3 
  END;
