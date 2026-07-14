import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await db.query(`
      SELECT manual_scores.*, users.name as student_name 
      FROM manual_scores 
      JOIN users ON manual_scores.student_id = users.id 
      ORDER BY manual_scores.created_at DESC
    `);
    return NextResponse.json({ success: true, scores: result.rows });
  } catch (error) {
    console.error('Error fetching manual scores:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { className, subject, topic, scoresData } = body;

    // scoresData is an array of objects: { student_id, score, notes }
    if (!scoresData || scoresData.length === 0) {
      return NextResponse.json({ error: 'No scores provided' }, { status: 400 });
    }

    // Prepare for bulk insert
    const values = [];
    const placeholders = [];
    let paramIndex = 1;

    scoresData.forEach((sd) => {
      // Only insert if score is provided and valid
      if (sd.score !== null && sd.score !== undefined && sd.score !== '') {
        placeholders.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
        values.push(sd.student_id, className, subject, topic, parseInt(sd.score), sd.notes || '');
      }
    });

    if (values.length === 0) {
      return NextResponse.json({ success: true, message: 'No valid scores to insert' });
    }

    const query = `
      INSERT INTO manual_scores (student_id, class_name, subject, topic, score, notes)
      VALUES ${placeholders.join(', ')}
    `;

    await db.query(query, values);

    return NextResponse.json({ success: true, message: 'Scores saved successfully' });
  } catch (error) {
    console.error('Error saving manual scores:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
