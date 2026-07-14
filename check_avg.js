const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.query(`
  SELECT * FROM manual_scores LIMIT 1
`).then(res => {
  console.log(res.rows);
  pool.end();
}).catch(console.error);
