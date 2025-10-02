const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'insert_sample_data.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Split by semicolon and filter out empty statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          await pool.execute(statement);
        } catch (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          // Continue with other statements
        }
      }
    }
    
    console.log('✅ Database seeding completed successfully!');
    
    // Verify data was inserted
    const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const [skills] = await pool.execute('SELECT COUNT(*) as count FROM skills');
    const [jobs] = await pool.execute('SELECT COUNT(*) as count FROM jobs');
    const [roadmaps] = await pool.execute('SELECT COUNT(*) as count FROM roadmaps');
    const [posts] = await pool.execute('SELECT COUNT(*) as count FROM community_posts');
    
    console.log('\n📊 Data Summary:');
    console.log(`👥 Users: ${users[0].count}`);
    console.log(`🛠️  Skills: ${skills[0].count}`);
    console.log(`💼 Jobs: ${jobs[0].count}`);
    console.log(`🗺️  Roadmaps: ${roadmaps[0].count}`);
    console.log(`📝 Community Posts: ${posts[0].count}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
