// app/perusahaan/lowongan/[listingId]/pelamar/page.tsx

import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, ArrowLeft } from 'lucide-react';
import ApplicantCard from '@/components/ui/ApplicantCard'; // Pastikan path ini benar

export default async function PelamarPage({ params }: { params: { listingId: string } }) {
  const supabase = createServerComponentClient({ cookies });

  // 1. Ambil sesi pengguna
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // 2. Verifikasi Keamanan: Pastikan pengguna adalah pemilik lowongan ini
  const { data: company } = await supabase.from('companies').select('id').eq('user_id', session.user.id).single();
  const { data: listing } = await supabase.from('listings').select('id, title, company_id').eq('id', params.listingId).single();

  if (!listing || !company || listing.company_id !== company.id) {
    return <div className="p-8 text-center text-red-500">Anda tidak berhak mengakses halaman ini.</div>;
  }

  // 3. Ambil daftar pelamar dengan query yang telah diperbaiki
  const { data: applications, error } = await supabase
    .from('applications')
    .select(`
      id,
      status,
      applied_at,
      students!inner ( id, full_name, cv_url, schools!inner ( name ) )
    `) // <-- PERBAIKAN: Menggunakan !inner untuk menjamin objek tunggal
    .eq('listing_id', params.listingId)
    .order('applied_at', { ascending: true });

  if (error) {
    console.error("Error fetching applicants:", error.message);
    return <div className="p-8 text-center text-red-500">Gagal memuat daftar pelamar.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/perusahaan/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 mb-4">
            <ArrowLeft size={16} />
            Kembali ke Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Daftar Pelamar</h1>
          <p className="mt-2 text-lg text-gray-600">
            Review kandidat untuk posisi: <span className="font-semibold text-indigo-600">{listing.title}</span>
          </p>
        </div>

        <div className="space-y-4">
          {applications && applications.length > 0 ? (
            // PERBAIKAN: Tidak perlu "membersihkan" data lagi, karena query sudah benar
            applications.map(app => (
              <ApplicantCard key={app.id} application={app as any} />
            ))
          ) : (
            <div className="text-center rounded-lg border-2 border-dashed border-gray-300 p-12 bg-white">
              <div className="flex justify-center">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Belum Ada Pelamar</h3>
              <p className="mt-1 text-sm text-gray-500">Saat ada siswa yang melamar, mereka akan muncul di sini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}