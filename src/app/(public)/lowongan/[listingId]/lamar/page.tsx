import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import LamarForm from '@/components/forms/LamarForm';

export default async function LamarPage({ params }: { params: { listingId: string } }) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // Ambil detail lowongan
  const { data: listing } = await supabase
    .from('listings')
    .select('id, title, companies(name)')
    .eq('id', params.listingId)
    .single();

  // DIUBAH: Ambil juga cv_url dari profil siswa
  const { data: student } = await supabase
    .from('students')
    .select('full_name, cv_url, schools(name)') // Ambil cv_url
    .eq('user_id', session.user.id)
    .single();

  if (!listing || !student) {
    return <div className="p-8 text-center text-red-500">Gagal memuat detail lamaran.</div>;
  }

  // Membersihkan data relasi untuk dikirim ke Client Component
  const cleanListing = { ...listing, companies: Array.isArray(listing.companies) ? listing.companies[0] : listing.companies };
  const cleanStudent = { ...student, schools: Array.isArray(student.schools) ? student.schools[0] : student.schools };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 shadow-lg rounded-lg">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Konfirmasi Lamaran</h1>
            <p className="mt-2 text-gray-600">Periksa detail di bawah sebelum mengirim lamaran.</p>
          </div>
          <LamarForm listing={cleanListing} student={cleanStudent} />
        </div>
      </div>
    </div>
  );
}