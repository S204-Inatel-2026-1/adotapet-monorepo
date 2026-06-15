// src/middleware.ts  ← DEVE ficar em src/, não em src/app/
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/perfil', '/minhas-solicitacoes', '/painel', '/ajuda'];
const authRoutes = ['/login', '/registro'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('adotapet_token')?.value;
  const { pathname } = request.nextUrl;

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
  ],
};