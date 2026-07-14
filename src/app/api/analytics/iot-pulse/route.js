import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Generate the last 6 days including today in postgres
    const query = `
      WITH last_6_days AS (
        SELECT current_date - i AS day_date
        FROM generate_series(5, 0, -1) i
      )
      SELECT 
        d.day_date, 
        COALESCE(COUNT(i.id), 0) as count
      FROM last_6_days d
      LEFT JOIN iot_interactions i 
        ON DATE(i.created_at) = d.day_date
      GROUP BY d.day_date
      ORDER BY d.day_date ASC
    `;
    const result = await db.query(query);

    return NextResponse.json({ success: true, pulse: result.rows });
  } catch (error) {
    console.error('Error fetching iot pulse:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
