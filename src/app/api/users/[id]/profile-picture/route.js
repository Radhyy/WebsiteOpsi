import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { profile_picture } = await request.json();

    if (!id || !profile_picture) {
      return NextResponse.json({ error: 'Missing id or profile_picture' }, { status: 400 });
    }

    const query = `
      UPDATE users 
      SET profile_picture = $1 
      WHERE id = $2 
      RETURNING id, name, email, role, profile_picture;
    `;
    
    const result = await pool.query(query, [profile_picture, id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Profile picture updated successfully',
      user: result.rows[0] 
    });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
