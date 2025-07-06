// app/perusahaan/buat-lowongan/page.tsx

import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import BuatLowonganForm from '@/components/forms/BuatLowonganForm';

type JobCategory = {
  id: string;
  name: string;
};

export default async function BuatLowonganPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  const { data: categories, error } = await supabase
    .from('job_categories')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching job categories:', error);
    return <div className="p-8 text-center text-red-500">Gagal memuat data kategori pekerjaan.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-8 shadow-lg rounded-lg">
          <div className="mb-8 border-b pb-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Buat Lowongan Magang Baru</h1>
            <p className="mt-2 text-gray-600">
              Isi detail di bawah ini untuk menemukan talenta vokasi yang tepat bagi perusahaan Anda.
            </p>
          </div>
          <BuatLowonganForm categories={categories || []} />
        </div>
      </div>
    </div>
  );
}