// components/layout/MainHeader.tsx

"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Session, User } from '@supabase/supabase-js';
import supabase from '@/lib/supabaseClient';
import { Menu, X } from 'lucide-react';

// Fungsi untuk mendapatkan link navigasi berdasarkan role
const getNavLinks = (role: string | undefined) => {
  switch (role) {
    case 'student':
      return [
        { name: 'Dashboard', href: '/siswa/dashboard' },
        { name: 'Cari Lowongan', href: '/lowongan' },
      ];
    case 'school_admin':
      return [
        { name: 'Dashboard', href: '/sekolah/dashboard' },
        { name: 'Profil Sekolah', href: '/sekolah/profil' },
      ];
    case 'company_admin':
      return [
        { name: 'Dashboard', href: '/perusahaan/dashboard' },
        { name: 'Buat Lowongan', href: '/perusahaan/buat-lowongan' },
      ];
    default:
      return [];
  }
};

const getProfileLink = (role: string | undefined) => {
  if (role === 'student') return '/siswa/profil';
  if (role === 'school_admin') return '/sekolah/profil';
  if (role === 'company_admin') return '/perusahaan/profil';
  return '/';
};

interface MainHeaderProps {
  session: Session | null;
}

export default function MainHeader({ session }: MainHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = session?.user;
  const role = user?.user_metadata?.role;

  // State untuk menu mobile dan dropdown profil
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };
  
  // Menutup menu saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = getNavLinks(role);
  const profileLink = getProfileLink(role);
  const avatarUrl = user?.user_metadata?.logo_url || null;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* --- PERUBAHAN STRUKTUR DI SINI --- */}
        <div className="flex h-16 items-center justify-between">
          
          {/* Elemen Kiri: Logo */}
          <div className="flex items-center">
            <Link href={user ? navLinks[0]?.href || '/' : '/'} className="flex-shrink-0">
              <Image src="/images/logo-talenta-vokasi.png" alt="Logo Talenta Vokasi" width={140} height={32} className="h-8 w-auto" priority />
            </Link>
          </div>

          {/* Elemen Kanan: Navigasi dan Menu digabung dalam satu div */}
          <div className="flex items-center">
            {/* Navigasi Desktop */}
            <nav className="hidden sm:flex sm:items-center sm:space-x-8">
              {user ? (
                navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link key={link.name} href={link.href} className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors ${isActive ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-indigo-400 hover:text-gray-700'}`}>
                      {link.name}
                    </Link>
                  );
                })
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">Masuk</Link>
                  <Link href="/register" className="ml-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors">Daftar Sekarang</Link>
                </>
              )}
            </nav>

            {/* Menu Profil (jika login) */}
            {user && (
              <div className="relative ml-4" ref={menuRef}>
                <button onClick={() => setProfileMenuOpen(!isProfileMenuOpen)} className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  <span className="sr-only">Open user menu</span>
                  {avatarUrl ? <Image src={avatarUrl} alt="Foto Profil" width={32} height={32} className="h-8 w-8 rounded-full object-cover" /> : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">{user.email?.charAt(0).toUpperCase()}</div>}
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                    <Link href={profileLink} onClick={() => setProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">Profil Saya</Link>
                    <button onClick={handleLogout} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-indigo-50">Logout</button>
                  </div>
                )}
              </div>
            )}

            {/* Tombol Menu Mobile */}
            <div className="sm:hidden ml-2">
              <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
          
        </div>
      </div>

      {/* Dropdown Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="sm:hidden absolute w-full bg-white shadow-lg" ref={!user ? menuRef : undefined}>
          <div className="space-y-1 pt-2 pb-3">
            {user ? (
              <>
                {navLinks.map((link) => <Link key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800">{link.name}</Link>)}
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800">Masuk</Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800">Daftar</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}