import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const query = `
      WITH StudentAverages AS (
        SELECT u.id, COALESCE(ROUND(AVG(m.score)), 0) as average_score
        FROM users u
        LEFT JOIN manual_scores m ON u.id = m.student_id
        WHERE u.role = 'student'
        GROUP BY u.id
      )
      SELECT 
        COUNT(*) as total_students,
        COALESCE(SUM(CASE WHEN average_score >= 70 THEN 1 ELSE 0 END), 0) as recovered_count,
        COALESCE(SUM(CASE WHEN average_score < 70 THEN 1 ELSE 0 END), 0) as pending_count
      FROM StudentAverages
    `;
    const result = await db.query(query);

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching intervention rate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
