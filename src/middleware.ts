// src/middleware.ts

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Buat Supabase client di dalam middleware
  const supabase = createMiddlewareClient({ req, res });

  // Ambil sesi pengguna saat ini
  const { data: { session } } = await supabase.auth.getSession();

  // Definisikan path publik yang boleh diakses tanpa login
  const publicPaths = ['/login', '/register', '/'];

  // Jika pengguna TIDAK login DAN mencoba mengakses path yang BUKAN publik
  if (!session && !publicPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
    // Arahkan (redirect) mereka ke halaman login
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Jika pengguna SUDAH login DAN mencoba mengakses halaman login/register
  if (session && publicPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
    // Arahkan mereka ke halaman utama atau dashboard yang sesuai
    // Anda bisa menambahkan logika role di sini jika perlu
    const homeUrl = new URL('/', req.url);
    return NextResponse.redirect(homeUrl);
  }

  return res;
}

// Konfigurasi Matcher
export const config = {
  matcher: [
    /*
     * Cocokkan semua path permintaan kecuali untuk:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};