const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tasks'`).then(res => {
  console.log(res.rows);
  pool.end();
}).catch(console.error);
