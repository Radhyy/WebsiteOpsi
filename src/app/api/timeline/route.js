import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tasksQuery = `
      SELECT id, title, created_at, 'action' as source_type, null as student_name, null as button_type
      FROM tasks
      ORDER BY created_at DESC
      LIMIT 10
    `;
    const tasksResult = await db.query(tasksQuery);

    const iotQuery = `
      SELECT i.id, i.created_at, 'iot' as source_type, u.name as student_name, i.button_type
      FROM iot_interactions i
      JOIN users u ON i.student_id = u.id
      ORDER BY i.created_at DESC
      LIMIT 10
    `;
    const iotResult = await db.query(iotQuery);

    const allEvents = [...tasksResult.rows, ...iotResult.rows].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const timelineData = allEvents.map((event, index) => {
      const dateObj = new Date(event.created_at);
      const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

      if (event.source_type === 'action') {
        return {
          id: `task-${event.id}`,
          type: 'action',
          time: timeStr,
          date: dateStr,
          icon: 'send',
          iconBg: 'bg-primary-container',
          iconColor: 'text-primary',
          content: `Anda menugaskan tugas '${event.title}'.`
        };
      } else {
        // IoT Event
        if (event.button_type === 'STRUGGLE' || event.button_type === 'HELP') {
          return {
            id: `iot-${event.id}`,
            type: 'alert',
            time: timeStr,
            date: dateStr,
            icon: 'warning',
            iconBg: 'bg-error-container',
            iconColor: 'text-error',
            content: `Peringatan: ${event.student_name} menekan tombol ${event.button_type === 'HELP' ? 'Bantuan' : 'Kesulitan'}.`
          };
        } else {
          // SUCCESS
          return {
            id: `iot-${event.id}`,
            type: 'ai',
            time: timeStr,
            date: dateStr,
            icon: 'psychology',
            iconBg: 'bg-secondary-container',
            iconColor: 'text-secondary',
            content: `AI Insight: ${event.student_name} berhasil menyelesaikan materi dengan baik.`,
            hasButton: false
          };
        }
      }
    });

    return NextResponse.json({ success: true, timeline: timelineData });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
