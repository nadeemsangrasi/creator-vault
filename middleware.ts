import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  // Check if the path is a protected route
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                           request.nextUrl.pathname.startsWith('/ideas');

  // Check if the path is a public route (should redirect authenticated users)
  const isPublicRoute = request.nextUrl.pathname.startsWith('/signin') ||
                        request.nextUrl.pathname.startsWith('/signup');

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Redirect authenticated users away from public routes
    if (isPublicRoute && session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Redirect unauthenticated users to signin
    if (isProtectedRoute && !session) {
      const signInUrl = new URL('/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  } catch (error) {
    // If session check fails, redirect to signin for protected routes
    if (isProtectedRoute) {
      const signInUrl = new URL('/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
