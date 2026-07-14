import { NextResponse } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request) {
  // Get the token from cookies
  const token = request.cookies.get('auth_token')?.value;
  
  // Paths that do not require authentication
  const isPublicPath = request.nextUrl.pathname === '/login' || request.nextUrl.pathname.startsWith('/api/');

  // If trying to access a protected route without a token
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access login page while already logged in
  if (isPublicPath && token && request.nextUrl.pathname === '/login') {
    // For simplicity, redirect to dashboard. 
    // In a real app we'd decode the JWT to check the role to redirect to the correct dashboard.
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
