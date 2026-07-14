const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addProfilePictureColumn() {
  try {
    console.log('Adding profile_picture column to users table...');
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS profile_picture TEXT;
    `);
    console.log('profile_picture column added successfully!');
  } catch (error) {
    console.error('Error altering table:', error);
  } finally {
    pool.end();
  }
}

addProfilePictureColumn();
