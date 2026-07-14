import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await db.query(`
      SELECT tasks.*, users.name as student_name, users.grade as student_grade 
      FROM tasks 
      JOIN users ON tasks.student_id = users.id 
      ORDER BY tasks.created_at DESC
    `);

    return NextResponse.json({ success: true, tasks: result.rows });
  } catch (error) {
    console.error('Error fetching all tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
