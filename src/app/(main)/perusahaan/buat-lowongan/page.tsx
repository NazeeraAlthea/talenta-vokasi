import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import BuatLowonganForm from '@/components/forms/BuatLowonganForm'; // Kita akan buat komponen ini

// Tipe untuk data kategori
type JobCategory = {
  id: string;
  name: string;
};

export default async function BuatLowonganPage() {
  const supabase = createServerComponentClient({ cookies });

  // Periksa sesi pengguna
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // Ambil daftar kategori pekerjaan dari database untuk ditampilkan di dropdown
  const { data: categories, error } = await supabase
    .from('job_categories')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching job categories:', error);
    // Tampilkan pesan error jika gagal mengambil kategori
    return <div className="p-8 text-red-500">Gagal memuat data kategori pekerjaan.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 shadow-lg rounded-lg">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Buat Lowongan Baru</h1>
          <p className="mt-2 text-gray-800">
            Isi detail di bawah untuk menemukan kandidat yang tepat untuk perusahaan Anda.
          </p>
        </div>
        {/* Render komponen form dan kirim data kategori sebagai props */}
        <BuatLowonganForm categories={categories} />
      </div>
    </div>
  );
}