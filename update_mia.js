require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function update() {
  await pool.query("UPDATE users SET profile_picture = 'https://i.ibb.co.com/gmyhXyC/Screenshot-2024-05-18-124933.png' WHERE id = 2");
  console.log('Updated Mia');
  pool.end();
}

update();
