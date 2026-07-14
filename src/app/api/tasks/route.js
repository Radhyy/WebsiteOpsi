import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const data = await request.json();
    const { studentId, title, deadline, questions } = data;

    if (!studentId || !title || !questions) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await db.query(
      `INSERT INTO tasks (student_id, title, deadline, questions, status) 
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [studentId, title, deadline || null, JSON.stringify(questions)]
    );

    return NextResponse.json({ success: true, task: result.rows[0] });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
