require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS iot_interactions (
        id SERIAL PRIMARY KEY, 
        student_id INTEGER REFERENCES users(id), 
        button_type VARCHAR(50), 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const count = await pool.query('SELECT COUNT(*) FROM iot_interactions WHERE student_id = 2');
    
    if (parseInt(count.rows[0].count) === 0) {
      console.log('Inserting dummy data...');
      
      const query = "INSERT INTO iot_interactions (student_id, button_type, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP - (INTERVAL '1 day' * $3))";
      
      // Some dummy data spread over the last 5 days
      const days = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 1, 2, 3, 4, 1, 2, 3];
      const types = ['SUCCESS', 'HELP', 'STRUGGLE', 'SUCCESS', 'SUCCESS', 'STRUGGLE', 'HELP', 'SUCCESS', 'SUCCESS', 'SUCCESS', 'SUCCESS', 'HELP', 'STRUGGLE', 'SUCCESS', 'STRUGGLE', 'SUCCESS', 'SUCCESS', 'SUCCESS'];
      
      for (let i = 0; i < days.length; i++) {
        await pool.query(query, [2, types[i], days[i]]);
      }
      
      console.log('Dummy data inserted');
    } else {
      console.log('Data already exists');
    }
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
