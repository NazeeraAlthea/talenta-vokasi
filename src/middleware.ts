// src/middleware.ts

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Gunakan getUser() untuk pemeriksaan yang lebih andal di middleware
  const { data: { user } } = await supabase.auth.getUser();

  // Definisikan path yang hanya bisa diakses setelah login
  const protectedPaths = ['/siswa', '/sekolah', '/perusahaan']; 
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));

  // Jika pengguna TIDAK login DAN mencoba mengakses path yang dilindungi
  if (!user && isProtectedPath) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Jika pengguna SUDAH login DAN mencoba mengakses halaman login/register
  if (user && (req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register'))) {
    // Arahkan ke dashboard yang sesuai berdasarkan role
    const role = user.user_metadata.role;
    let dashboardUrl = '/'; // Halaman fallback jika role tidak ada
    
    if (role === 'student') dashboardUrl = '/siswa/dashboard';
    if (role === 'school_admin') dashboardUrl = '/sekolah/dashboard';
    if (role === 'company_admin') dashboardUrl = '/perusahaan/dashboard';
    
    return NextResponse.redirect(new URL(dashboardUrl, req.url));
  }

  return res;
}

// Konfigurasi Matcher (tidak berubah)
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};