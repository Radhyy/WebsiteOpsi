import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT NOW()');
    return NextResponse.json({
      status: 'OK',
      message: 'Next.js Backend is running',
      db_time: result.rows[0].now,
      database: 'Connected successfully to Neon DB via Next.js API Routes!'
    });
  } catch (err) {
    console.error('Database connection error:', err);
    return NextResponse.json(
      { error: 'Database connection failed', details: err.message },
      { status: 500 }
    );
  }
}
