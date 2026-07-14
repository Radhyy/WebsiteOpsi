import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Group Interventions: Find a topic where average score is low (< 75)
    const topicQuery = `
      SELECT topic, ROUND(AVG(score)) as avg_score
      FROM manual_scores
      GROUP BY topic
      HAVING AVG(score) < 75
      ORDER BY avg_score ASC
      LIMIT 1
    `;
    const topicResult = await db.query(topicQuery);
    
    let groupIntervention = null;
    if (topicResult.rows.length > 0) {
      const topic = topicResult.rows[0].topic;
      // Get students who scored poorly in this topic
      const studentsQuery = `
        SELECT u.id, u.name
        FROM manual_scores m
        JOIN users u ON m.student_id = u.id
        WHERE m.topic = $1 AND m.score < 75
        ORDER BY m.score ASC
        LIMIT 5
      `;
      const studentsResult = await db.query(studentsQuery, [topic]);
      
      if (studentsResult.rows.length > 0) {
        groupIntervention = {
          topic: topic,
          students: studentsResult.rows.map(s => ({
            id: s.id,
            name: s.name,
            initials: s.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
          })),
          recommendation: `Beberapa siswa mendapat nilai kurang pada topik ${topic}. Jadwalkan sesi ulasan kelompok.`
        };
      }
    }

    // 2. Individual Interventions: Find a student with many STRUGGLE/HELP interactions
    const individualQuery = `
      SELECT u.id, u.name, COUNT(i.id) as struggle_count
      FROM iot_interactions i
      JOIN users u ON i.student_id = u.id
      WHERE i.button_type IN ('STRUGGLE', 'HELP')
      GROUP BY u.id, u.name
      ORDER BY struggle_count DESC
      LIMIT 1
    `;
    const individualResult = await db.query(individualQuery);
    
    let individualIntervention = null;
    if (individualResult.rows.length > 0) {
      const student = individualResult.rows[0];
      individualIntervention = {
        name: student.name,
        issue: `Siswa ini telah menekan tombol Bantuan / Kesulitan sebanyak ${student.struggle_count} kali.`,
        recommendation: `Direkomendasikan untuk memberikan sesi bimbingan 1-on-1.`
      };
    }

    // 3. History: Recent tasks assigned
    const historyQuery = `
      SELECT title, status, created_at
      FROM tasks
      ORDER BY created_at DESC
      LIMIT 2
    `;
    const historyResult = await db.query(historyQuery);
    
    const history = historyResult.rows.map(row => ({
      title: row.title,
      description: `Tugas diberikan pada ${new Date(row.created_at).toLocaleDateString('id-ID')}`,
      result: row.status === 'completed' ? 'Selesai Dikerjakan' : 'Belum Dikerjakan'
    }));

    return NextResponse.json({ 
      success: true, 
      group: groupIntervention,
      individual: individualIntervention,
      history: history
    });

  } catch (error) {
    console.error('Error fetching interventions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
