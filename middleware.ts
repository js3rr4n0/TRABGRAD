import { auth } from '@/auth';
import { NextResponse } from 'next/server';

const roleRoutes: Record<string, string[]> = {
  '/dashboard/admin': ['administrador'],
  '/dashboard/coordinador': ['coordinador'],
  '/dashboard/asesor': ['asesor'],
  '/dashboard/egresado': ['egresado'],
};

export default auth((req) => {
  const { nextUrl, auth: session } = req as any;
  const isLoggedIn = !!session;
  const path = nextUrl.pathname;

  if (path.startsWith('/dashboard') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  for (const [route, roles] of Object.entries(roleRoutes)) {
    if (path.startsWith(route)) {
      const userRole = session?.user?.role;
      if (!roles.includes(userRole)) {
        return NextResponse.redirect(new URL('/unauthorized', nextUrl));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*'],
};