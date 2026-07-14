const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function alterTasksTable() {
  try {
    console.log('Adding score column to tasks table...');
    await pool.query(`
      ALTER TABLE tasks
      ADD COLUMN IF NOT EXISTS score INTEGER;
    `);
    console.log('Score column added successfully!');
  } catch (error) {
    console.error('Error altering tasks table:', error);
  } finally {
    pool.end();
  }
}

alterTasksTable();
