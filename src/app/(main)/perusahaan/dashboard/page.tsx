// src/app/(main)/perusahaan/dashboard/page.tsx

import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import { Briefcase, Users, FileText } from 'lucide-react';

// Tipe data untuk lowongan yang digabungkan dengan jumlah pelamar
type ListingWithApplicantCount = {
  id: string;
  title: string;
  is_active: boolean;
  created_at: string;
  applications: { count: number }[];
};

// Tipe data untuk profil perusahaan
type CompanyProfile = {
  company_name: string;
  industry: string;
  website: string | null;
  logo_url: string | null;
};

export default async function PerusahaanDashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // 1. Ambil sesi pengguna saat ini
  const { data: { session } } = await supabase.auth.getSession();

  // Jika tidak ada sesi, redirect ke halaman login
  if (!session) {
    redirect('/login');
  }

  // 2. Ambil data profil perusahaan dari tabel 'companies'
  // Diasumsikan 'user_id' di tabel 'companies' terhubung dengan 'id' di 'auth.users'
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, name, industry, website, logo_url')
    .eq('user_id', session.user.id)
    .single();

  if (companyError || !company) {
    console.error('Error fetching company profile:', companyError);
    // Anda bisa menampilkan halaman error di sini
    return <div className="p-8">Gagal memuat profil perusahaan. Silakan coba lagi.</div>;
  }

  // 3. Ambil data lowongan (listings) beserta jumlah pelamarnya (applications)
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select(`
      id,
      title,
      is_active,
      created_at,
      applications (
        count
      )
    `)
    .eq('company_id', company.id) // Asumsi ada company.id setelah mengambil profil
    .order('created_at', { ascending: false });

  if (listingsError) {
    console.error('Error fetching listings:', listingsError);
    return <div className="p-8">Gagal memuat data lowongan.</div>;
  }

  // 4. Hitung statistik total
  const totalListings = listings?.length || 0;
  const activeListings = listings?.filter(l => l.is_active).length || 0;
  const totalApplicants = listings?.reduce((sum, l) => sum + (l.applications[0]?.count || 0), 0) || 0;


  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Selamat Datang */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Selamat Datang, {company.name}!
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Kelola lowongan Anda dan temukan talenta terbaik di sini.
          </p>
        </div>

        {/* Kartu Statistik */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Briefcase className="h-6 w-6 text-indigo-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Lowongan
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {totalListings}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Lowongan Aktif
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {activeListings}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Pelamar
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {totalApplicants}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daftar Lowongan Terbaru */}
        <div className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Lowongan Anda</h2>
            <a
              href="/perusahaan/buat-lowongan" // Ganti dengan link yang sesuai
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              + Buat Lowongan Baru
            </a>
          </div>
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <ul role="list" className="divide-y divide-gray-200">
              {listings && listings.length > 0 ? (
                listings.map((listing) => (
                  <li key={listing.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-medium text-indigo-600 truncate">
                          {listing.title}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            listing.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {listing.is_active ? 'Aktif' : 'Nonaktif'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            {(listing.applications[0]?.count || 0)} Pelamar
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            Dibuat pada {new Date(listing.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm sm:mt-0">
                          <a href={`/perusahaan/lowongan/${listing.id}/pelamar`} className="font-medium text-indigo-600 hover:text-indigo-500">
                            Lihat Pelamar
                          </a>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <div className="text-center py-12 px-4">
                  <p className="text-gray-500">Anda belum membuat lowongan apapun.</p>
                </div>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}