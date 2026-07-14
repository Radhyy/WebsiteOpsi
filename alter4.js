const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createManualScoresTable() {
  try {
    console.log('Creating manual_scores table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS manual_scores (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        class_name VARCHAR(50),
        subject VARCHAR(100),
        topic VARCHAR(200),
        score INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('manual_scores table created successfully!');
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    pool.end();
  }
}

createManualScoresTable();
