const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createSchedulesTable() {
  try {
    console.log('Creating schedules table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        time TIME NOT NULL,
        location VARCHAR(200) NOT NULL,
        notes TEXT,
        status VARCHAR(50) DEFAULT 'upcoming',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('schedules table created successfully!');
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    pool.end();
  }
}

createSchedulesTable();
