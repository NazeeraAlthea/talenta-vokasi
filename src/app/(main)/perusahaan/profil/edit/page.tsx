// app/perusahaan/profil/edit/page.tsx

import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import EditPerusahaanForm from '@/components/forms/EditPerusahaanForm';

export default async function EditPerusahaanProfilePage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // Ambil data perusahaan yang sedang login
  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  // --- PERUBAHAN DI SINI: Ambil juga daftar kategori ---
  const { data: categories } = await supabase
    .from('job_categories')
    .select('name')
    .order('name', { ascending: true });


  if (error || !company) {
    console.error('Error fetching company profile for editing:', error);
    return <div className="p-8 text-center text-red-500">Gagal memuat profil perusahaan.</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 shadow-lg rounded-lg">
          <div className="mb-8 border-b pb-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Edit Profil Perusahaan</h1>
            <p className="mt-2 text-gray-600">Perbarui informasi perusahaan Anda agar tetap akurat.</p>
          </div>
          {/* Teruskan data kategori sebagai props */}
          <EditPerusahaanForm company={company} categories={categories || []} />
        </div>
      </div>
    </div>
  );
}