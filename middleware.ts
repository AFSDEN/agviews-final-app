import { NextRequest, NextResponse } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/assessment',
  '/assessment-results',
  '/api/assessments',
  '/api/user',
];

// Routes that redirect to dashboard if user is already authenticated
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // No token
  if (!token) {
    if (isProtectedRoute) {
      // Redirect to login if trying to access protected route
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (isAuthRoute) {
      // Allow access to auth routes
      return NextResponse.next();
    }
    // Allow access to public routes
    return NextResponse.next();
  }

  // Has token
  if (token) {
    if (isAuthRoute) {
      // Redirect to dashboard if already authenticated
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (isProtectedRoute) {
      // Allow access to protected routes
      return NextResponse.next();
    }
    // Allow access to public routes
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
