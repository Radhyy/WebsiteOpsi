import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { SignJWT } from 'jose';

export async function POST(request) {
  try {
    const { email, password, role } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Email, password, and role are required' }, { status: 400 });
    }

    // Direct match for dummy data
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1 AND password = $2 AND role = $3',
      [email, password, role]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Kredensial tidak valid' }, { status: 401 });
    }

    const user = result.rows[0];

    // Create a basic JWT token using jose
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'rahasia_belajar_pintar_123');
    const token = await new SignJWT({ id: user.id, role: user.role, name: user.name, email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    const response = NextResponse.json({ success: true, user: { id: user.id, role: user.role, name: user.name } });

    // Set HTTP-only cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
