import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import EditProfileForm from '@/components/forms/EditProfileForm'; // Komponen form baru kita

export default async function EditProfilePage() {
  const supabase = createServerComponentClient({ cookies });

  // Ambil sesi pengguna
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // 1. Ambil data profil siswa yang sedang login
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('*') // Ambil semua data siswa
    .eq('user_id', session.user.id)
    .single();

  // 2. Ambil semua data sekolah untuk pilihan dropdown
  const { data: schools, error: schoolsError } = await supabase
    .from('schools')
    .select('id, name')
    .order('name');

  // 3. Ambil semua data jurusan untuk pilihan dropdown
  const { data: majors, error: majorsError } = await supabase
    .from('majors')
    .select('id, name')
    .order('name');

  if (studentError || schoolsError || majorsError || !student) {
    return <div className="p-8 text-center text-red-500">Gagal memuat data untuk edit profil.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-6 sm:p-8 shadow-lg rounded-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profil & CV</h1>
          {/* Render Client Component dan kirim semua data yang dibutuhkan sebagai props */}
          <EditProfileForm 
            student={student} 
            schools={schools || []} 
            majors={majors || []}
          />
        </div>
      </div>
    </div>
  );
}