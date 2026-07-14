const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createTasksTable() {
  try {
    console.log('Creating tasks table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        deadline DATE,
        questions JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tasks table created successfully!');
  } catch (error) {
    console.error('Error creating tasks table:', error);
  } finally {
    pool.end();
  }
}

createTasksTable();
