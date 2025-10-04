const express = require('express');
const pool = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const { validate, submitChallengeSchema } = require('../middleware/validation');
const { evaluateCode } = require('../utils/ai');
const { updateUserXP, updateStreak } = require('../utils/helpers');
const { errorResponse, successResponse } = require('../utils/helpers');

const router = express.Router();

// Helper functions to generate default challenge data
function getDefaultCodeTemplate(title) {
  const templates = {
    'JavaScript Loops': `function countEvenNumbers() {
  // Tulis kode Anda di sini
  // Gunakan loop untuk menghitung angka genap dari 1 sampai 100
  // Return jumlah angka genap
}`,
    'Array Manipulation': `function findMaxNumber(arr) {
  // Tulis kode Anda di sini
  // Cari angka terbesar dalam array
  // Return angka terbesar
}`,
    'String Reversal': `function reverseString(str) {
  // Tulis kode Anda di sini
  // Balik string yang diberikan
  // Return string yang sudah dibalik
}`,
    'Data Structure: Stack': `class Stack {
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
}`,
    'Algorithm: Binary Search': `function binarySearch(arr, target) {
  // Tulis kode Anda di sini
  // Implementasikan binary search
  // Return index jika ditemukan, -1 jika tidak
}`,
    'Async Programming': `async function fetchUserData(userId) {
  // Tulis kode Anda di sini
  // Gunakan fetch untuk mengambil data user
  // Handle error dengan try-catch
  // Return data user atau null jika error
}`,
    'Full Stack: Todo App': `class TodoManager {
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
}`,
    'Algorithm: Path Finding': `function findShortestPath(grid, start, end) {
  // Tulis kode Anda di sini
  // Implementasikan BFS untuk mencari jalur terpendek
  // Return array koordinat jalur atau null jika tidak ada jalur
}`,
    'System Design: Cache Implementation': `class LRUCache {
  constructor(capacity) {
    // Inisialisasi cache dengan kapasitas
  }
  
  get(key) {
    // Implementasi get dengan LRU logic
  }
  
  put(key, value) {
    // Implementasi put dengan LRU logic
  }
}`
  };
  
  return templates[title] || `// Tulis kode Anda di sini\n// Implementasikan solusi untuk: ${title}`;
}

function getDefaultRequirements(title) {
  const requirements = {
    'JavaScript Loops': ['Gunakan loop for atau while', 'Hitung angka genap dari 1 sampai 100', 'Return jumlah total angka genap'],
    'Array Manipulation': ['Menerima parameter array angka', 'Menggunakan loop untuk mencari nilai terbesar', 'Return nilai terbesar'],
    'String Reversal': ['Menerima parameter string', 'Membalik urutan karakter', 'Return string yang dibalik'],
    'Data Structure: Stack': ['Implementasikan class Stack', 'Method push untuk menambah elemen', 'Method pop untuk menghapus elemen', 'Method peek untuk melihat elemen teratas', 'Method isEmpty untuk cek apakah kosong'],
    'Algorithm: Binary Search': ['Array sudah diurutkan (ascending)', 'Menggunakan binary search algorithm', 'Return index elemen jika ditemukan', 'Return -1 jika tidak ditemukan'],
    'Async Programming': ['Gunakan async/await', 'Gunakan fetch API', 'Handle error dengan try-catch', 'Return data atau null'],
    'Full Stack: Todo App': ['Implementasikan class TodoManager', 'Method createTodo untuk membuat todo baru', 'Method getAllTodos untuk mengambil semua todo', 'Method updateTodo untuk mengupdate todo', 'Method deleteTodo untuk menghapus todo', 'Method toggleComplete untuk toggle status'],
    'Algorithm: Path Finding': ['Grid adalah array 2D dengan 0 (path) dan 1 (obstacle)', 'Start dan end adalah koordinat [row, col]', 'Menggunakan BFS algorithm', 'Return array koordinat jalur terpendek', 'Return null jika tidak ada jalur'],
    'System Design: Cache Implementation': ['Constructor menerima parameter capacity', 'Method get untuk mengambil value berdasarkan key', 'Method put untuk menyimpan key-value pair', 'Implementasi LRU replacement policy', 'Update order saat get dan put']
  };
  
  return requirements[title] || ['Implementasikan solusi sesuai dengan deskripsi'];
}

function getDefaultExamples(title) {
  const examples = {
    'JavaScript Loops': [{'input': 'countEvenNumbers()', 'output': '50'}],
    'Array Manipulation': [{'input': 'findMaxNumber([1, 5, 3, 9, 2])', 'output': '9'}],
    'String Reversal': [{'input': 'reverseString("hello")', 'output': '"olleh"'}],
    'Data Structure: Stack': [{'input': 'const stack = new Stack(); stack.push(1); stack.push(2); stack.peek();', 'output': '2'}],
    'Algorithm: Binary Search': [{'input': 'binarySearch([1, 3, 5, 7, 9], 5)', 'output': '2'}],
    'Async Programming': [{'input': 'fetchUserData(1)', 'output': 'Promise yang resolve dengan data user'}],
    'Full Stack: Todo App': [{'input': 'const manager = new TodoManager(); manager.createTodo("Learn JS", "Study JavaScript basics");', 'output': 'Todo object dengan id, title, description, completed: false'}],
    'Algorithm: Path Finding': [{'input': 'findShortestPath([[0,0,0],[0,1,0],[0,0,0]], [0,0], [2,2])', 'output': '[[0,0], [0,1], [0,2], [1,2], [2,2]]'}],
    'System Design: Cache Implementation': [{'input': 'const cache = new LRUCache(2); cache.put(1, 1); cache.put(2, 2); cache.get(1);', 'output': '1'}]
  };
  
  return examples[title] || [{'input': 'function()', 'output': 'expected result'}];
}

function getDefaultTestCases(title) {
  const testCases = {
    'JavaScript Loops': [{'test_case': 'Basic functionality', 'input': 'countEvenNumbers()', 'expected_output': '50'}],
    'Array Manipulation': [{'test_case': 'Basic functionality', 'input': 'findMaxNumber([1, 5, 3, 9, 2])', 'expected_output': '9'}],
    'String Reversal': [{'test_case': 'Basic functionality', 'input': 'reverseString("hello")', 'expected_output': '"olleh"'}],
    'Data Structure: Stack': [{'test_case': 'Basic stack operations', 'input': 'const stack = new Stack(); stack.push(1); stack.push(2); stack.peek();', 'expected_output': '2'}],
    'Algorithm: Binary Search': [{'test_case': 'Element found', 'input': 'binarySearch([1, 3, 5, 7, 9], 5)', 'expected_output': '2'}],
    'Async Programming': [{'test_case': 'Successful fetch', 'input': 'fetchUserData(1)', 'expected_output': 'Promise resolved with user data'}],
    'Full Stack: Todo App': [{'test_case': 'Create and retrieve todo', 'input': 'const manager = new TodoManager(); manager.createTodo("Test", "Test todo"); manager.getAllTodos();', 'expected_output': 'Array dengan 1 todo object'}],
    'Algorithm: Path Finding': [{'test_case': 'Simple path finding', 'input': 'findShortestPath([[0,0,0],[0,1,0],[0,0,0]], [0,0], [2,2])', 'expected_output': 'Array koordinat jalur terpendek'}],
    'System Design: Cache Implementation': [{'test_case': 'Basic LRU operations', 'input': 'const cache = new LRUCache(2); cache.put(1, 1); cache.put(2, 2); cache.get(1);', 'expected_output': '1'}]
  };
  
  return testCases[title] || [{'test_case': 'Basic test', 'input': 'function()', 'expected_output': 'expected result'}];
}

// Get all challenges grouped by type
router.get('/', async (req, res) => {
  try {
    const [challenges] = await pool.execute(`
      SELECT c.*, 
             uc.status as user_status,
             uc.completed_at,
             uc.score
      FROM challenges c
      LEFT JOIN user_challenges uc ON c.id = uc.challenge_id AND uc.user_id = ?
      ORDER BY c.type, c.created_at
    `, [req.user?.id || 0]);

    // Group challenges by type
    const groupedChallenges = {
      daily: challenges.filter(c => c.type === 'daily'),
      weekly: challenges.filter(c => c.type === 'weekly'),
      monthly: challenges.filter(c => c.type === 'monthly')
    };

    return successResponse(res, groupedChallenges, 'Challenges retrieved successfully');

  } catch (error) {
    console.error('Get challenges error:', error);
    return errorResponse(res, 500, 'Failed to retrieve challenges', error.message);
  }
});

// Get challenge leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const [leaderboard] = await pool.execute(`
      SELECT 
        u.id,
        u.name,
        u.title,
        u.avatar_url,
        u.xp_total,
        COUNT(uc.challenge_id) as challenges_completed,
        ROW_NUMBER() OVER (ORDER BY u.xp_total DESC, COUNT(uc.challenge_id) DESC) as rank
      FROM users u
      LEFT JOIN user_challenges uc ON u.id = uc.user_id AND uc.status = 'completed'
      GROUP BY u.id, u.name, u.title, u.avatar_url, u.xp_total
      ORDER BY u.xp_total DESC, challenges_completed DESC
      LIMIT 10
    `);

    return successResponse(res, leaderboard, 'Challenge leaderboard retrieved successfully');

  } catch (error) {
    console.error('Get challenge leaderboard error:', error);
    return errorResponse(res, 500, 'Failed to retrieve challenge leaderboard', error.message);
  }
});

// Get challenge by ID
router.get('/:id', async (req, res) => {
  try {
    const challengeId = req.params.id;

    const [challenges] = await pool.execute(`
      SELECT c.*, 
             uc.status as user_status,
             uc.completed_at,
             uc.score
      FROM challenges c
      LEFT JOIN user_challenges uc ON c.id = uc.challenge_id AND uc.user_id = ?
      WHERE c.id = ?
    `, [req.user?.id || 0, challengeId]);

    if (challenges.length === 0) {
      return errorResponse(res, 404, 'Challenge not found');
    }

    const challenge = challenges[0];

    // Add default values for fields that don't exist in database
    challenge.language = 'javascript';
    challenge.code_template = getDefaultCodeTemplate(challenge.title);
    challenge.requirements = getDefaultRequirements(challenge.title);
    challenge.examples = getDefaultExamples(challenge.title);
    challenge.test_cases = getDefaultTestCases(challenge.title);

    return successResponse(res, challenge, 'Challenge retrieved successfully');

  } catch (error) {
    console.error('Get challenge error:', error);
    return errorResponse(res, 500, 'Failed to retrieve challenge', error.message);
  }
});

// Start a challenge
router.post('/:id/start', requireAuth, async (req, res) => {
  try {
    const challengeId = req.params.id;
    const userId = req.user.id;

    // Check if challenge exists
    const [challenges] = await pool.execute(
      'SELECT id, title FROM challenges WHERE id = ?',
      [challengeId]
    );

    if (challenges.length === 0) {
      return errorResponse(res, 404, 'Challenge not found');
    }

    // Check if user already started this challenge
    const [existingProgress] = await pool.execute(
      'SELECT id, status FROM user_challenges WHERE user_id = ? AND challenge_id = ?',
      [userId, challengeId]
    );

    if (existingProgress.length > 0) {
      if (existingProgress[0].status === 'completed') {
        return errorResponse(res, 400, 'Challenge already completed');
      }
      // Update status to in_progress
      await pool.execute(
        'UPDATE user_challenges SET status = "in_progress" WHERE user_id = ? AND challenge_id = ?',
        [userId, challengeId]
      );
    } else {
      // Create new progress record
      await pool.execute(
        'INSERT INTO user_challenges (user_id, challenge_id, status, created_at) VALUES (?, ?, "in_progress", NOW())',
        [userId, challengeId]
      );
    }

    return successResponse(res, { message: 'Challenge started successfully' }, 'Challenge started');

  } catch (error) {
    console.error('Start challenge error:', error);
    return errorResponse(res, 500, 'Failed to start challenge', error.message);
  }
});

// Submit challenge solution (temporary without auth for testing)
router.post('/:id/submit', validate(submitChallengeSchema), async (req, res) => {
  try {
    const challengeId = req.params.id;
    const userId = 5; // Temporary hardcoded user ID for testing (Nadine C)
    const { code } = req.body;

    // Get challenge details
    const [challenges] = await pool.execute(
      'SELECT * FROM challenges WHERE id = ?',
      [challengeId]
    );

    if (challenges.length === 0) {
      return errorResponse(res, 404, 'Challenge not found');
    }

    const challenge = challenges[0];

    // Get challenge data using helper functions
    const requirements = getDefaultRequirements(challenge.title);
    const examples = getDefaultExamples(challenge.title);
    const testCases = getDefaultTestCases(challenge.title);

    // Evaluate code using GROQ
    const evaluationResult = await evaluateCode(
      code,
      challenge.language || 'javascript',
      challenge.description
    );

    // Calculate XP based on score
    const xpEarned = evaluationResult.passed ? challenge.xp_reward : 0;

    // Update user progress
    if (evaluationResult.passed) {
      // Mark as completed
      await pool.execute(
        'INSERT INTO user_challenges (user_id, challenge_id, status, completed_at, score) VALUES (?, ?, "completed", NOW(), ?) ON DUPLICATE KEY UPDATE status = "completed", completed_at = NOW(), score = ?',
        [userId, challengeId, evaluationResult.score, evaluationResult.score]
      );

      // Award XP
      await updateUserXP(userId, xpEarned, 'challenge_complete', challengeId);

      // Update streak
      await updateStreak(userId);

      // Record activity
      await pool.execute(
        'INSERT INTO activities (user_id, type, meta, xp_earned) VALUES (?, "challenge_complete", ?, ?)',
        [userId, JSON.stringify({ challenge_id: challengeId, challenge_title: challenge.title }), xpEarned]
      );
    } else {
      // Update status to failed
      await pool.execute(
        'INSERT INTO user_challenges (user_id, challenge_id, status, score) VALUES (?, ?, "failed", ?) ON DUPLICATE KEY UPDATE status = "failed", score = ?',
        [userId, challengeId, evaluationResult.score, evaluationResult.score]
      );
    }

    return successResponse(res, {
      passed: evaluationResult.passed,
      score: evaluationResult.score,
      feedback: evaluationResult.feedback,
      hints: evaluationResult.hints || [],
      test_results: evaluationResult.test_results || [],
      xp_earned: xpEarned
    }, 'Challenge submitted successfully');

  } catch (error) {
    console.error('Submit challenge error:', error);
    return errorResponse(res, 500, 'Failed to submit challenge', error.message);
  }
});

// Get user's challenge progress
router.get('/users/:userId/progress', requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    // Check if user is getting their own progress
    if (userId !== req.user.id) {
      return errorResponse(res, 403, 'You can only view your own challenge progress');
    }

    const [progress] = await pool.execute(`
      SELECT 
        COUNT(*) as total_challenges,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_challenges,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_challenges,
        SUM(CASE WHEN status = 'completed' THEN xp_reward ELSE 0 END) as total_xp_earned
      FROM user_challenges uc
      JOIN challenges c ON uc.challenge_id = c.id
      WHERE uc.user_id = ?
    `, [userId]);

    const [recentChallenges] = await pool.execute(`
      SELECT c.title, c.type, uc.status, uc.completed_at, c.xp_reward
      FROM user_challenges uc
      JOIN challenges c ON uc.challenge_id = c.id
      WHERE uc.user_id = ?
      ORDER BY uc.completed_at DESC, uc.started_at DESC
      LIMIT 10
    `, [userId]);

    return successResponse(res, {
      stats: progress[0],
      recent_challenges: recentChallenges
    }, 'Challenge progress retrieved successfully');

  } catch (error) {
    console.error('Get challenge progress error:', error);
    return errorResponse(res, 500, 'Failed to retrieve challenge progress', error.message);
  }
});

module.exports = router;