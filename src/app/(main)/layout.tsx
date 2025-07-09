import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Header from '@/components/MainHeader';

type NavLink = {
  name: string;
  href: string;
};

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Langsung baca role dari user_metadata yang ada di sesi.
  const userRole = session.user.user_metadata?.role;

  let navLinks: NavLink[] = [];
  let profileLink: string = '/profil';
  let dashboardLink: string = '/';

  // Tentukan link navigasi berdasarkan role
  if (userRole === 'school_admin') {
    dashboardLink = '/sekolah/dashboard';
    profileLink = '/sekolah/profil';
    navLinks = [
      { name: 'Dashboard', href: dashboardLink },
      { name: 'Manajemen Jurusan', href: '/sekolah/manajemen-jurusan' },
      { name: 'Verifikasi Siswa', href: '/sekolah/verifikasi-siswa' },
    ];
  } else if (userRole === 'student') {
    dashboardLink = '/siswa/dashboard';
    profileLink = '/siswa/profil';
    navLinks = [
      { name: 'Cari Lowongan', href: dashboardLink },
      { name: 'Lamaran Saya', href: '/siswa/lamaran-saya' },
    ];
  } else if (userRole === 'company_admin') {
    profileLink = '/perusahaan/profil';
    navLinks = [
      { name: 'Dashboard', href: '/perusahaan/dashboard' },
      { name: 'Buat Lowongan', href: '/perusahaan/buat-lowongan' },
    ];
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={session.user}
        navLinks={navLinks}
        profileLink={profileLink}
      />
      <main>
        {children}
      </main>
    </div>
  );
}
