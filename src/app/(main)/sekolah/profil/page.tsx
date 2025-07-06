import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import SekolahProfileClient from '@/components/ui/SekolahProfile'; // Komponen UI

// Definisikan tipe data untuk profil sekolah
type SchoolProfile = {
  id: string;
  name: string;
  npsn: string;
  accreditation: string;
  level: string;
  address: string | null;
  logo_url: string | null;
};

export default async function SekolahProfilePage() {
  const supabase = createServerComponentClient({ cookies });

  // Ambil sesi pengguna
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // Ambil data sekolah berdasarkan user_id yang login
  const { data: school, error } = await supabase
    .from('schools')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (error || !school) {
    console.error('Error fetching school profile:', error);
    return <div className="p-8 text-center text-red-500">Profil sekolah tidak ditemukan atau gagal dimuat.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SekolahProfileClient 
          school={school as SchoolProfile} 
          email={session.user.email!} 
        />
      </div>
    </div>
  );
}