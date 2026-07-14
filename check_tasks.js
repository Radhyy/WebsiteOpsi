const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query(`
  SELECT * FROM (
    SELECT 'manual_score' as activity_type, topic as activity_name, score, created_at, 'completed' as status
    FROM manual_scores
    WHERE student_id = $1

    UNION ALL

    SELECT 'task' as activity_type, title as activity_name, score, created_at, status
    FROM tasks
    WHERE student_id = $1
  ) combined
  ORDER BY created_at DESC
  LIMIT 5
`, [2]).then(res => { 
  console.log(res.rows); 
  pool.end(); 
});
