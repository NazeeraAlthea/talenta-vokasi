// app/perusahaan/profil/page.tsx

import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import PerusahaanProfileClient from '@/components/ui/PerusahaanProfile'; // Import komponen UI

// Tipe data untuk profil perusahaan
type CompanyProfile = {
  name: string;
  industry: string | null;
  website: string | null;
  address: string | null;
  logo_url: string | null;
};

export default async function PerusahaanProfilePage() {
  const supabase = createServerComponentClient({ cookies });

  // Ambil sesi pengguna
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // Ambil data perusahaan berdasarkan user_id yang login
  const { data: company, error } = await supabase
    .from('companies')
    .select('name, industry, website, address, logo_url')
    .eq('user_id', session.user.id)
    .single();

  if (error || !company) {
    console.error('Error fetching company profile:', error);
    // Mungkin arahkan ke halaman setup profil jika profil belum ada
    return <div className="p-8 text-center text-red-500">Profil perusahaan tidak ditemukan atau gagal dimuat.</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Profil Perusahaan</h1>
            <p className="mt-2 text-lg text-gray-600">Kelola informasi perusahaan Anda yang akan dilihat oleh calon talenta.</p>
        </div>
        {/* Mengirim data ke Client Component untuk ditampilkan */}
        <PerusahaanProfileClient 
            company={company as CompanyProfile} 
            email={session.user.email!} 
        />
      </div>
    </div>
  );
}