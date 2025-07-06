// app/siswa/lamaran-saya/page.tsx

import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Send, 
  Eye, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Inbox,
  Clock 
} from 'lucide-react';

// Tipe Data (tidak berubah)
type ApplicationStatus = 'APPLIED' | 'VIEWED' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED';
type Application = {
  status: ApplicationStatus;
  applied_at: string;
  listings: {
    id: string;
    title: string;
    companies: {
      name: string;
      logo_url: string | null;
    } | null;
  } | null;
};

// Komponen untuk Badge Status (tidak berubah)
const StatusBadge = ({ status }: { status: ApplicationStatus }) => {
  const statusInfo = {
    APPLIED: { text: 'Terkirim', icon: Send, color: 'bg-blue-100 text-blue-800' },
    VIEWED: { text: 'Dilihat', icon: Eye, color: 'bg-purple-100 text-purple-800' },
    INTERVIEW: { text: 'Wawancara', icon: Calendar, color: 'bg-orange-100 text-orange-800' },
    ACCEPTED: { text: 'Diterima', icon: CheckCircle2, color: 'bg-green-100 text-green-800' },
    REJECTED: { text: 'Ditolak', icon: XCircle, color: 'bg-red-100 text-red-800' },
  };
  const currentStatus = statusInfo[status] || statusInfo.APPLIED;
  const Icon = currentStatus.icon;
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${currentStatus.color}`}><Icon size={14} />{currentStatus.text}</span>;
};

// Komponen untuk Kartu Lamaran (disederhanakan karena data sudah bersih)
const ApplicationCard = ({ application }: { application: Application }) => {
  if (!application.listings) return null;

  const { listings } = application;
  const company = listings.companies; 
  const companyName = company?.name || 'Perusahaan';
  const initial = companyName.charAt(0).toUpperCase() || '?';
  const appliedDate = new Date(application.applied_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="flex-shrink-0">
          {company?.logo_url ? <Image width={48} height={48} className="h-12 w-12 rounded-full object-cover" src={company.logo_url} alt={`${companyName} logo`} /> : <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">{initial}</div>}
        </div>
        <div className="flex-grow">
          <Link href={`/lowongan/${listings.id}`} className="text-lg font-semibold text-gray-900 hover:text-indigo-600">{listings.title}</Link>
          <p className="text-sm font-medium text-gray-700">{companyName}</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500"><Clock size={14} /><span>Dilamar pada {appliedDate}</span></div>
        </div>
        <div className="w-full sm:w-auto mt-4 sm:mt-0 flex justify-end">
          <StatusBadge status={application.status} />
        </div>
      </div>
    </div>
  );
};


// Komponen Utama Halaman
export default async function LamaranSayaPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: student } = await supabase.from('students').select('id').eq('user_id', session.user.id).single();
  if (!student) return <div className="p-8 text-center">Profil siswa tidak ditemukan.</div>;
  
  // Ambil data lamaran mentah dari Supabase
  const { data: rawApplications, error } = await supabase
    .from('applications')
    .select(`status, applied_at, listings ( id, title, companies ( name, logo_url ) )`)
    .eq('student_id', student.id)
    .order('applied_at', { ascending: false });

  if (error) {
    console.error("Error fetching applications:", error.message);
    return <div className="p-8 text-center text-red-500">Gagal memuat riwayat lamaran.</div>;
  }

  // --- PERBAIKAN DI SINI: Proses "Pembersihan" Data ---
  const cleanApplications = rawApplications?.map(app => {
    const listingObj = Array.isArray(app.listings) ? app.listings[0] : app.listings;
    
    // Pastikan listingObj ada sebelum mencoba mengakses companies
    if (listingObj) {
      const companyObj = Array.isArray(listingObj.companies) ? listingObj.companies[0] : listingObj.companies;
      // Kembalikan objek dengan struktur yang bersih
      return {
        ...app,
        listings: {
          ...listingObj,
          companies: companyObj || null,
        }
      };
    }
    
    // Jika listingObj tidak ada, kembalikan data aplikasi asli dengan listings null
    return { ...app, listings: null };
  }) || [];


  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Riwayat Lamaran Saya</h1>
          <p className="mt-2 text-lg text-gray-600">Lacak status semua lowongan yang telah Anda lamar.</p>
        </div>

        <div className="space-y-6">
          {/* Gunakan data yang sudah bersih untuk di-render */}
          {cleanApplications.length > 0 ? (
            cleanApplications.map((app, index) => (
              <ApplicationCard key={index} application={app as Application} />
            ))
          ) : (
            <div className="text-center rounded-lg border-2 border-dashed border-gray-300 p-12 mt-12 bg-white">
              <div className="flex justify-center"><Inbox className="h-12 w-12 text-gray-400" /></div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Anda Belum Melamar</h3>
              <p className="mt-1 text-sm text-gray-500">Semua lowongan yang Anda lamar akan muncul di sini.</p>
              <div className="mt-6">
                <Link href="/siswa/dashboard" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">Cari Lowongan Sekarang</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}