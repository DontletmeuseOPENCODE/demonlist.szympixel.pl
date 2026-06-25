import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import type { SessionData } from '@/lib/session';

const sessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'demonlist_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Chronione ścieżki
  const isAdminRoute = pathname.startsWith('/admin');
  const isApiProtected =
    pathname.startsWith('/api/demons') ||
    pathname.startsWith('/api/victors') ||
    pathname.startsWith('/api/users');

  if (!isAdminRoute && !isApiProtected) {
    return NextResponse.next();
  }

  // Sprawdź sesję
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(request, res, sessionOptions);

  if (!session.isLoggedIn) {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Moderator nie może wchodzić do /admin/users i nie może modyfikować demonów przez API
  if (session.role === 'moderator') {
    if (pathname.startsWith('/admin/users')) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    if (
      (pathname.startsWith('/api/demons') || pathname.startsWith('/api/users')) &&
      request.method !== 'GET'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/api/demons/:path*', '/api/victors/:path*', '/api/users/:path*'],
};
