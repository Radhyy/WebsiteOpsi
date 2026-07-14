import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    const result = await db.query(
      "SELECT * FROM tasks WHERE student_id = $1 ORDER BY created_at DESC",
      [id]
    );

    return NextResponse.json({ success: true, tasks: result.rows });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
