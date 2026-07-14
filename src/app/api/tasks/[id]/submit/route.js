import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { answers } = await request.json();

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Invalid answers format' }, { status: 400 });
    }

    // Ambil tugas dari database untuk membandingkan jawaban
    const taskRes = await db.query('SELECT questions FROM tasks WHERE id = $1', [id]);
    
    if (taskRes.rows.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    let questions = taskRes.rows[0].questions;
    if (typeof questions === 'string') {
        try {
            questions = JSON.parse(questions);
        } catch (e) {
            questions = [];
        }
    }

    // Hitung nilai
    let correctCount = 0;
    
    answers.forEach(answer => {
      const q = questions.find(q => q.id === answer.questionId);
      if (q && q.correctOption === answer.selectedOption) {
        correctCount++;
      }
    });

    const totalQuestions = questions.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // Update status and score
    await db.query(
      `UPDATE tasks SET status = 'completed', score = $1 WHERE id = $2`,
      [score, id]
    );

    return NextResponse.json({ success: true, score });
  } catch (error) {
    console.error('Error submitting task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
