import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import { Briefcase, Users, FileText, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import ListingManagementCard from '@/components/ui/ListingManagementCard'; // Import komponen baru

export default async function PerusahaanDashboardPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: company, error: companyError } = await supabase.from('companies').select('id, name').eq('user_id', session.user.id).single();
  if (companyError || !company) {
    console.error('Error fetching company profile:', companyError);
    return <div className="p-8">Gagal memuat profil perusahaan.</div>;
  }

  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select(`id, title, is_active, created_at, applications(count)`)
    .eq('company_id', company.id)
    .order('created_at', { ascending: false });

  if (listingsError) {
    console.error('Error fetching listings:', listingsError);
    return <div className="p-8">Gagal memuat data lowongan.</div>;
  }

  const totalListings = listings?.length || 0;
  const activeListings = listings?.filter(l => l.is_active).length || 0;
  const totalApplicants = listings?.reduce((sum, l) => sum + (l.applications[0]?.count || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Selamat Datang */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Selamat Datang, {company.name}!</h1>
          <p className="mt-2 text-lg text-gray-600">Kelola lowongan Anda dan temukan talenta terbaik di sini.</p>
        </div>

        {/* Kartu Statistik */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg"><div className="p-5"><div className="flex items-center"><div className="flex-shrink-0"><Briefcase className="h-6 w-6 text-indigo-500" /></div><div className="ml-5 w-0 flex-1"><dl><dt className="text-sm font-medium text-gray-500 truncate">Total Lowongan</dt><dd className="text-3xl font-semibold text-gray-900">{totalListings}</dd></dl></div></div></div></div>
          <div className="bg-white overflow-hidden shadow rounded-lg"><div className="p-5"><div className="flex items-center"><div className="flex-shrink-0"><FileText className="h-6 w-6 text-green-500" /></div><div className="ml-5 w-0 flex-1"><dl><dt className="text-sm font-medium text-gray-500 truncate">Lowongan Aktif</dt><dd className="text-3xl font-semibold text-gray-900">{activeListings}</dd></dl></div></div></div></div>
          <div className="bg-white overflow-hidden shadow rounded-lg"><div className="p-5"><div className="flex items-center"><div className="flex-shrink-0"><Users className="h-6 w-6 text-blue-500" /></div><div className="ml-5 w-0 flex-1"><dl><dt className="text-sm font-medium text-gray-500 truncate">Total Pelamar</dt><dd className="text-3xl font-semibold text-gray-900">{totalApplicants}</dd></dl></div></div></div></div>
        </div>

        {/* Daftar Lowongan Anda */}
        <div className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Manajemen Lowongan</h2>
            <Link href="/perusahaan/buat-lowongan" className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
              <PlusCircle size={18} /> Buat Lowongan Baru
            </Link>
          </div>
          
          {listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {listings.map((listing) => (
                <ListingManagementCard key={listing.id} listing={listing as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 bg-white rounded-lg shadow-sm border">
              <p className="text-gray-500">Anda belum membuat lowongan apapun.</p>
              <Link href="/perusahaan/buat-lowongan" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                Buat Lowongan Pertama Anda
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}