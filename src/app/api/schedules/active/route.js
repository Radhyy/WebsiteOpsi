import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    const scheduleRes = await db.query(`
      SELECT schedules.*, users.name as teacher_name 
      FROM schedules 
      JOIN users ON schedules.teacher_id = users.id
      WHERE schedules.student_id = $1 AND (schedules.status = 'upcoming' OR schedules.status = 'confirmed')
      ORDER BY schedules.date DESC, schedules.time DESC
      LIMIT 1
    `, [studentId]);

    if (scheduleRes.rows.length === 0) {
      return NextResponse.json({ success: true, schedule: null });
    }

    return NextResponse.json({ success: true, schedule: scheduleRes.rows[0] });
  } catch (error) {
    console.error('Error fetching active schedule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
