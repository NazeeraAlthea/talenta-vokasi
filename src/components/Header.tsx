"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User } from '@supabase/supabase-js';
import supabase from '@/lib/supabaseClient';

type NavLink = {
  name: string;
  href: string;
};

interface HeaderProps {
  user: User;
  navLinks: NavLink[];
  profileLink: string;
}

export default function Header({ user, navLinks, profileLink }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname(); // Hook untuk mendapatkan path saat ini
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null); // Ref untuk dropdown

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };
  
  // Menutup dropdown saat klik di luar area menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Ambil URL avatar dari metadata, jika ada
  const avatarUrl = user.user_metadata?.avatar_url || null;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            {/* LOGO MENGGUNAKAN IMAGE */}
            <Link href="/" className="flex flex-shrink-0 items-center">
              <Image 
                src="/images/logo-talenta-vokasi.png" 
                alt="Logo Talenta Vokasi" 
                width={200} 
                height={32} 
                className="h-8 w-auto"
                priority
              />
            </Link>
            {/* NAVIGASI DENGAN STATUS AKTIF */}
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-indigo-400 hover:text-gray-700'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="ml-6 flex items-center">
            <div className="relative ml-3" ref={profileMenuRef}>
              <div>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span className="sr-only">Open user menu</span>
                  {/* Tampilkan gambar profil jika ada, jika tidak, tampilkan inisial */}
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt="Foto Profil" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
              </div>
              {/* DROPDOWN MENU DENGAN STYLE BARU */}
              {isProfileMenuOpen && (
                <div
                  className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                >
                  <Link
                    href={profileLink}
                    onClick={() => setProfileMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                    role="menuitem"
                  >
                    Profil Saya
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-indigo-50"
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}