import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    const result = await db.query(
      "SELECT id, name, email, grade, parent_phone, profile_picture FROM users WHERE id = $1 AND role = 'student'",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Fetch learning gaps (bottom 3 topics)
    const gapsResult = await db.query(
      `SELECT topic, ROUND(AVG(score)) as mastery_score
       FROM manual_scores
       WHERE student_id = $1
       GROUP BY topic
       ORDER BY mastery_score ASC
       LIMIT 3`,
      [id]
    );

    // Fetch recent activities (last 5 scores from both manual scores and tasks)
    const activitiesResult = await db.query(
      `SELECT * FROM (
        SELECT 'manual_score' as activity_type, topic as activity_name, score, created_at, 'completed' as status
        FROM manual_scores
        WHERE student_id = $1

        UNION ALL

        SELECT 'task' as activity_type, title as activity_name, score, created_at, status
        FROM tasks
        WHERE student_id = $1
      ) combined
      ORDER BY created_at DESC
      LIMIT 5`,
      [id]
    );

    // Fetch IoT signals (last 7 days)
    const iotResult = await db.query(
      `SELECT EXTRACT(ISODOW FROM created_at) as day_of_week, button_type, COUNT(*) as count
       FROM iot_interactions
       WHERE student_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY day_of_week, button_type`,
      [id]
    );

    return NextResponse.json({ 
      success: true, 
      student: result.rows[0],
      learningGaps: gapsResult.rows,
      recentActivities: activitiesResult.rows,
      iotData: iotResult.rows
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
