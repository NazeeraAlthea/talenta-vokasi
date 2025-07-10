"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Session } from '@supabase/supabase-js';
import supabase from '@/lib/supabaseClient';
import { Menu, X, UserCircle, LogOut } from 'lucide-react';

// Fungsi utilitas tidak berubah...
const getNavLinks = (role: string | undefined) => {
    switch (role) {
        case 'student': return [{ name: 'Dashboard', href: '/siswa/dashboard' }];
        case 'school_admin': return [{ name: 'Dashboard', href: '/sekolah/dashboard' }];
        case 'company_admin': return [{ name: 'Dashboard', href: '/perusahaan/dashboard' }];
        default: return [];
    }
};

const getProfileLink = (role: string | undefined) => {
    if (role === 'student') return '/siswa/profil';
    if (role === 'school_admin') return '/sekolah/profil';
    if (role === 'company_admin') return '/perusahaan/profil';
    return '/';
};

interface PublicHeaderProps {
    session: Session | null;
}

export default function PublicHeader({ session }: PublicHeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const user = session?.user;
    const role = user?.user_metadata?.role;

    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
    
    // REVISI 1: Ganti nama ref agar lebih jelas dan tambahkan ref untuk panel mobile
    const headerRightRef = useRef<HTMLDivElement>(null);
    const mobilePanelRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        setProfileMenuOpen(false);
        setMobileMenuOpen(false);
        await supabase.auth.signOut();
        router.push('/login');
    };

    // REVISI 2: Perbaiki total logika handleClickOutside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Cek apakah klik terjadi di luar area header kanan DAN di luar panel mobile
            if (
                headerRightRef.current && !headerRightRef.current.contains(event.target as Node) &&
                mobilePanelRef.current && !mobilePanelRef.current.contains(event.target as Node)
            ) {
                setProfileMenuOpen(false);
                setMobileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navLinks = getNavLinks(role);
    const profileLink = getProfileLink(role);
    const userInitial = user?.email?.charAt(0).toUpperCase() || '?';
    const avatarUrl = user?.user_metadata?.logo_url || null;

    return (
        <header className={`${pathname === '/' ? 'absolute bg-transparent backdrop-blur-sm text-white' : 'sticky bg-white shadow-sm text-gray-800'} top-0 left-0 w-full z-50 transition-colors`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <Link href={user ? (navLinks[0]?.href || '/') : '/'} className="flex-shrink-0">
                            <Image src="/images/logo-talenta-vokasi.png" alt="Logo Talenta Vokasi" width={140} height={32} className="h-8 w-auto" priority />
                        </Link>
                    </div>

                    {/* REVISI 3: Pasang ref yang sudah diganti namanya */}
                    <div className="flex items-center" ref={headerRightRef}>
                        <nav className="hidden md:flex items-center space-x-6">
                            {user ? (
                                navLinks.map((link) => {
                                    const isActive = pathname.startsWith(link.href);
                                    return <Link key={link.name} href={link.href} className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-200 hover:bg-gray-100 hover:text-gray-600'}`}>{link.name}</Link>
                                })
                            ) : (
                                <>
                                    <Link href="/login" className="text-sm font-medium hover:text-indigo-300">Masuk</Link>
                                    <Link href="/register" className="ml-4 rounded-md bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-gray-200">Daftar Sekarang</Link>
                                </>
                            )}
                        </nav>

                        {user && (
                            <div className="relative ml-4 hidden md:block">
                                <button onClick={() => setProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center gap-2 rounded-full p-1 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    {avatarUrl ? (
                                        <Image src={avatarUrl} alt="Avatar" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-500 text-white font-semibold">{userInitial}</span>
                                    )}
                                </button>
                                {isProfileMenuOpen && (
                                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <div className="py-1">
                                            <p className="px-4 pt-2 pb-1 text-xs text-gray-400">Masuk sebagai</p>
                                            <p className="px-4 pb-2 text-sm font-medium text-gray-900 truncate border-b">{user.email}</p>
                                            <Link href={profileLink} onClick={() => setProfileMenuOpen(false)} className="flex w-full text-left items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><UserCircle size={16} /> Profil Saya</Link>
                                            <button onClick={handleLogout} className="flex w-full text-left items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"><LogOut size={16} /> Keluar</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="md:hidden ml-2">
                            <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className={`inline-flex items-center justify-center rounded-md p-2 ${pathname === '/' ? 'text-white/80 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'}`}>
                                <span className="sr-only">Buka menu</span>
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Panel Dropdown Menu Mobile */}
                {isMobileMenuOpen && (
                    // REVISI 4: Pasang ref untuk panel mobile
                    <div ref={mobilePanelRef} className="md:hidden absolute w-full left-0 mt-1 bg-white shadow-lg border-t" id="mobile-menu">
                        <div className="space-y-1 px-2 pt-2 pb-3">
                            {user ? (
                                <>
                                    {navLinks.map((link) => <Link key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className={`block rounded-md px-3 py-2 text-base font-medium ${pathname.startsWith(link.href) ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>{link.name}</Link>)}
                                    <div className="border-t border-gray-200 !my-2"></div>
                                    <Link href={profileLink} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100"><UserCircle size={20} /> Profil Saya</Link>
                                    <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left rounded-md px-3 py-2 text-base font-medium text-red-600 hover:bg-gray-100"><LogOut size={20} /> Keluar</button>
                                </>
                            ) : (
                                <>
                                    {/* Tetap gunakan tag <a> untuk keandalan maksimal */}
                                    <a href="/login" className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100">Masuk</a>
                                    <a href="/register" className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100">Daftar</a>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}