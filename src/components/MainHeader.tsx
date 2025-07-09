"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { ChevronDown, LogOut, UserCircle, Menu, X } from 'lucide-react';

// Tipe data & fungsi helper tidak perlu diubah
type NavLink = { name: string; href: string; };
type HeaderProps = { user: User; navLinks: NavLink[]; profileLink: string; };

export default function Header({ user, navLinks, profileLink }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientComponentClient();
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null); // Ref untuk seluruh bagian kanan header

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  const userInitial = user.email?.charAt(0).toUpperCase() || '?';
  
  // Ambil avatar dari metadata. Kita bisa gunakan logo sekolah/perusahaan jika ada.
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.logo_url || null;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex items-center gap-8">
            <Link href="/" className="flex-shrink-0">
              <Image src="/images/logo-talenta-vokasi.png" alt="Logo Talenta Vokasi" width={40} height={40} priority className="h-auto" />
            </Link>
            <nav className="hidden md:flex gap-4">
              {navLinks.map((link) => {
                // ✨ REVISI 1: Logika 'isActive' lebih fleksibel
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link key={link.name} href={link.href} className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}>
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2" ref={menuRef}>
            {/* Dropdown Profil (Hanya tampil di desktop) */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 rounded-full p-1 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {avatarUrl ? (
                    <Image src={avatarUrl} alt="Avatar" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-500 text-white font-semibold">{userInitial}</span>
                )}
                <span className="hidden lg:block font-medium">{user.email}</span>
                <ChevronDown size={16} className={`hidden lg:block transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isProfileMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs text-gray-400">Masuk sebagai</div>
                    <p className="px-4 pb-2 text-sm font-medium text-gray-900 truncate border-b">{user.email}</p>
                    <Link href={profileLink} onClick={() => setProfileMenuOpen(false)} className="flex w-full text-left items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><UserCircle size={16} /> Profil Saya</Link>
                    <button onClick={handleLogout} className="flex w-full text-left items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"><LogOut size={16} /> Keluar</button>
                  </div>
                </div>
              )}
            </div>

            {/* Tombol Menu Mobile */}
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Dropdown Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden" ref={menuRef}>
            <nav className="space-y-1 px-2 pt-2 pb-4 border-t absolute w-full bg-white shadow-lg">
              {navLinks.map((link) => (<Link key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className={`block rounded-md px-3 py-2 text-base font-medium ${pathname === link.href ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>{link.name}</Link>))}
              <div className="border-t border-gray-200 !my-2"></div>
              <Link href={profileLink} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100"><UserCircle size={20} /> Profil Saya</Link>
              <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left rounded-md px-3 py-2 text-base font-medium text-red-600 hover:bg-gray-100"><LogOut size={20} /> Keluar</button>
            </nav>
        </div>
      )}
    </header>
  );
}