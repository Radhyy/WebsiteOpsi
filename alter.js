const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function alterDb() {
  try {
    console.log('Adding grade and parent_phone to users table...');
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS grade VARCHAR(50),
      ADD COLUMN IF NOT EXISTS parent_phone VARCHAR(50)
    `);
    console.log('Columns added successfully!');
  } catch (error) {
    console.error('Error altering database:', error);
  } finally {
    pool.end();
  }
}

alterDb();
