import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const query = `
      SELECT topic, subject, ROUND(AVG(score)) as average_score
      FROM manual_scores
      GROUP BY topic, subject
      ORDER BY average_score DESC
      LIMIT 10
    `;
    const result = await db.query(query);

    return NextResponse.json({ success: true, trends: result.rows });
  } catch (error) {
    console.error('Error fetching trend analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
