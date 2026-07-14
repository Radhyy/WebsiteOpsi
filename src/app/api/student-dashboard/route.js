import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId') || 2; // Default to student ID 2 if not provided

    // 1. Get Student Info
    const studentRes = await db.query('SELECT name, email, grade FROM users WHERE id = $1 AND role = $2', [studentId, 'student']);
    if (studentRes.rows.length === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    const student = studentRes.rows[0];

    // 2. Get Pending Tasks Count & Latest Special Mission
    const tasksRes = await db.query(`
      SELECT * FROM tasks 
      WHERE student_id = $1 AND status = 'pending' 
      ORDER BY created_at DESC
    `, [studentId]);
    
    const pendingTasksCount = tasksRes.rows.length;
    const latestTask = pendingTasksCount > 0 ? tasksRes.rows[0] : null;

    // 3. Get Upcoming Schedule
    const scheduleRes = await db.query(`
      SELECT schedules.*, users.name as teacher_name 
      FROM schedules 
      JOIN users ON schedules.teacher_id = users.id
      WHERE schedules.student_id = $1 AND (schedules.status = 'upcoming' OR schedules.status = 'confirmed')
      ORDER BY schedules.date ASC, schedules.time ASC
      LIMIT 1
    `, [studentId]);
    
    const upcomingSchedule = scheduleRes.rows.length > 0 ? scheduleRes.rows[0] : null;

    // 4. Get Online Users (Mocking by fetching 4 random users/teachers)
    const onlineRes = await db.query(`
      SELECT id, name, role, grade FROM users WHERE id != $1 LIMIT 4
    `, [studentId]);
    const onlineUsers = onlineRes.rows;

    return NextResponse.json({ 
      success: true, 
      data: {
        student,
        pendingTasksCount,
        latestTask,
        upcomingSchedule,
        onlineUsers
      }
    });

  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
