import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { score, notes } = await request.json();

    if (score === undefined) {
      return NextResponse.json({ error: 'Score is required' }, { status: 400 });
    }

    const query = `
      UPDATE manual_scores 
      SET score = $1, notes = $2
      WHERE id = $3
      RETURNING *
    `;
    const result = await db.query(query, [score, notes || '', id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Score not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, score: result.rows[0] });
  } catch (error) {
    console.error('Error updating score:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
