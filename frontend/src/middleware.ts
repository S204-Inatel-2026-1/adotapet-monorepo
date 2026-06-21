// src/middleware.ts  ← DEVE ficar em src/, não em src/app/
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/perfil', '/minhas-solicitacoes', '/painel', '/ajuda'];
const authRoutes = ['/login', '/registro'];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Proxy API/Uploads requests to the backend using runtime environment variables
  if (pathname.startsWith('/api-backend')) {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const remainingPath = pathname.substring('/api-backend'.length);
    const targetUrl = new URL(`${backendUrl}${remainingPath}${search}`);
    return NextResponse.rewrite(targetUrl);
  }

  if (pathname.startsWith('/uploads/')) {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const targetUrl = new URL(`${backendUrl}${pathname}${search}`);
    return NextResponse.rewrite(targetUrl);
  }

  // 2. Authentication & Authorization routing
  const token = request.cookies.get('adotapet_token')?.value;

  if (protectedRoutes.some(r => pathname.startsWith(r)) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (authRoutes.some(r => pathname.startsWith(r)) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/perfil/:path*',
    '/minhas-solicitacoes/:path*',
    '/painel/:path*',
    '/ajuda/:path*',
    '/login',
    '/registro',
    '/api-backend/:path*',
    '/uploads/:path*',
  ],
};