import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { studentId, date, time, location, notes } = await request.json();

    if (!studentId || !date || !time || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Default teacher_id = 1 (Misal Ms. Sarah)
    const teacherId = 1;

    const query = `
      INSERT INTO schedules (student_id, teacher_id, date, time, location, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await db.query(query, [studentId, teacherId, date, time, location, notes || '']);

    return NextResponse.json({ success: true, schedule: result.rows[0] });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
