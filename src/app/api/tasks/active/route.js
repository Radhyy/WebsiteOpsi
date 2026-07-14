import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId') || 2; // Default to student ID 2 (Mia)

    // Ambil tugas yang statusnya 'pending'
    const query = `
      SELECT * FROM tasks
      WHERE student_id = $1 AND status = 'pending'
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const result = await db.query(query, [studentId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: true, mission: null });
    }

    const mission = result.rows[0];
    
    // Pastikan field questions adalah array
    if (typeof mission.questions === 'string') {
        try {
            mission.questions = JSON.parse(mission.questions);
        } catch (e) {
            mission.questions = [];
        }
    }

    return NextResponse.json({ success: true, mission });
  } catch (error) {
    console.error('Error fetching active mission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
