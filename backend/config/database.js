const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'strive_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  insecureAuth: true,
  authPlugins: {
    mysql_native_password: () => () => Buffer.alloc(0)
  }
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('⚠️  Continuing without database connection...');
    // Don't exit, just log the error
  }
};

// Initialize database connection
testConnection();

module.exports = pool;
