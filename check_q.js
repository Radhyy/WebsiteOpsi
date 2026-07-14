const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.query(`SELECT questions FROM tasks LIMIT 1`).then(res => {
  console.log(JSON.stringify(res.rows[0].questions, null, 2));
  pool.end();
}).catch(console.error);
