import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import EditSekolahForm from '@/components/forms/EditSekolahForm';

export default async function EditSekolahPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // Ambil data sekolah saat ini untuk diisikan ke form
  const { data: school, error } = await supabase
    .from('schools')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (error || !school) {
    return <div className="p-8 text-center text-red-500">Gagal memuat profil sekolah untuk diedit.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-6 sm:p-8 shadow-lg rounded-xl border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Profil Sekolah</h1>
          <EditSekolahForm school={school} />
        </div>
      </div>
    </div>
  );
}