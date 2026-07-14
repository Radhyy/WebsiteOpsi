import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const { id } = await params;

    // Update status to 'confirmed'
    await db.query(
      `UPDATE schedules SET status = 'confirmed' WHERE id = $1`,
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error confirming schedule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
