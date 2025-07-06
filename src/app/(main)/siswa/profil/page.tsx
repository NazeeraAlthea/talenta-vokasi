import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import SiswaProfileClient from '@/components/ui/SiswaProfile'; 

// Definisikan tipe data untuk status verifikasi
type VerificationStatus = 'PENDING' | 'VERIFIED_BY_SCHOOL' | 'REJECTED';

// Tipe data untuk hasil join
type StudentProfile = {
  id: string;
  full_name: string;
  nisn: string;
  cv_url: string | null;
  portfolio_url: string | null;
  verification_status: VerificationStatus; // <-- 1. TAMBAHKAN TIPE DI SINI
  schools: {
    name: string;
  } | null;
  majors: {
    name: string;
  } | null;
};

export default async function SiswaProfilePage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // Ambil data lengkap siswa dengan me-JOIN tabel schools dan majors
  const { data: student, error } = await supabase
    .from('students')
    .select(`
      id,
      full_name,
      nisn,
      cv_url,
      portfolio_url,
      verification_status,
      schools ( name ),
      majors ( name )
    `) // <-- 2. PASTIKAN verification_status DIAMBIL DI SINI
    .eq('user_id', session.user.id)
    .single();

  if (error || !student) {
    console.error('Error fetching student profile:', error);
    return <div className="p-8 text-center text-red-500">Profil siswa tidak ditemukan atau gagal dimuat.</div>;
  }
  
  // Membersihkan data relasi sebelum dikirim (praktik yang baik)
  const cleanStudent = {
    ...student,
    schools: Array.isArray(student.schools) ? student.schools[0] : student.schools,
    majors: Array.isArray(student.majors) ? student.majors[0] : student.majors,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Mengirim data ke Client Component untuk ditampilkan */}
        <SiswaProfileClient 
            student={cleanStudent as StudentProfile} 
            email={session.user.email!} 
        />
      </div>
    </div>
  );
}