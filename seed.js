const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  try {
    console.log('Creating users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        name VARCHAR(255)
      )
    `);

    console.log('Clearing old users...');
    await pool.query('DELETE FROM users');

    console.log('Inserting dummy users...');
    await pool.query(`
      INSERT INTO users (email, password, role, name)
      VALUES 
        ('teacher@school.edu', 'password123', 'teacher', 'Ms. Sarah'),
        ('student@school.edu', 'password123', 'student', 'Mia Chen'),
        ('admin@school.edu', 'password123', 'admin', 'Super Admin')
    `);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    pool.end();
  }
}

seed();
