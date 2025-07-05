import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import LamarForm from '@/components/forms/LamarForm'; // Komponen form interaktif

// Tipe data untuk halaman ini
type LamarPageProps = {
  params: {
    listingId: string;
  };
};

export default async function LamarPage({ params }: LamarPageProps) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // 1. Ambil sesi pengguna
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // 2. Ambil detail lowongan berdasarkan ID dari URL
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id, title, companies(name)')
    .eq('id', params.listingId)
    .single();

  // 3. Ambil profil siswa yang sedang login
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('full_name, schools(name)')
    .eq('user_id', session.user.id)
    .single();

  // Handle jika data tidak ditemukan
  if (listingError || studentError || !listing || !student) {
    return (
      <div className="p-8 text-center text-red-500">
        Gagal memuat detail lamaran atau profil Anda. Silakan kembali dan coba lagi.
      </div>
    );
  }

  // Membersihkan data relasi sebelum dikirim ke client component
  const cleanListing = {
    ...listing,
    companies: Array.isArray(listing.companies) ? listing.companies[0] : listing.companies,
  };
  const cleanStudent = {
    ...student,
    schools: Array.isArray(student.schools) ? student.schools[0] : student.schools,
  };


  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 shadow-lg rounded-lg">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Konfirmasi Lamaran</h1>
            <p className="mt-2 text-gray-600">Satu langkah lagi untuk mengirimkan lamaran Anda.</p>
          </div>
          {/* Render Client Component dan kirim data sebagai props */}
          <LamarForm listing={cleanListing} student={cleanStudent} />
        </div>
      </div>
    </div>
  );
}