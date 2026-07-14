import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await db.query(`
      SELECT u.id, u.name, u.email, u.profile_picture,
             COALESCE(ROUND(AVG(m.score)), 0) as average_score
      FROM users u
      LEFT JOIN manual_scores m ON u.id = m.student_id
      WHERE u.role = 'student'
      GROUP BY u.id, u.name, u.email, u.profile_picture
    `);

    return NextResponse.json({ success: true, students: result.rows });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, grade, email, parentPhone, password } = await request.json();

    if (!name || !grade || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Role is always 'student' for this endpoint
    const role = 'student';

    const result = await db.query(
      `INSERT INTO users (name, email, password, role, grade, parent_phone) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, grade`,
      [name, email, password, role, grade, parentPhone || null]
    );

    return NextResponse.json({ success: true, student: result.rows[0] });
  } catch (error) {
    console.error('Error creating student:', error);
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
