// app/siswa/dashboard/page.tsx

import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image'; // <-- 1. Import Image dari Next.js
import { Inbox } from 'lucide-react'; // <-- 2. Import ikon untuk placeholder

// Tipe data untuk lowongan
type Listing = {
  id: string;
  title: string;
  location: string;
  companies: {
    name: string;
    logo_url: string | null;
  } | null;
};

// Komponen Kartu Lowongan dengan gaya yang disempurnakan
const ListingCard = ({ listing }: { listing: Listing }) => {
  const companyName = listing.companies?.name || 'Perusahaan';
  const initial = companyName.charAt(0).toUpperCase() || '?';

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="flex-grow">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {/* 3. Gunakan <Image /> untuk optimasi */}
            {listing.companies?.logo_url ? (
              <Image 
                width={48} height={48} 
                className="h-12 w-12 rounded-full object-cover" 
                src={listing.companies.logo_url} 
                alt={`${companyName} logo`} 
              />
            ) : (
              // 4. Sesuaikan warna avatar fallback
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">
                {initial}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600">
              <Link href={`/lowongan/${listing.id}`}>{listing.title}</Link>
            </h3>
            <p className="text-sm font-medium text-gray-700">{companyName}</p>
            <p className="mt-1 text-sm text-gray-500">{listing.location}</p>
          </div>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-end">
        <Link href={`/lowongan/${listing.id}/lamar`} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          Lamar Sekarang
        </Link>
      </div>
    </div>
  );
};


// Fungsi utama halaman sekarang menjadi 'async'
export default async function SiswaDashboardPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  const { data: listings, error } = await supabase
    .from('listings')
    .select(`id, title, location, companies ( name, logo_url )`)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching listings:", error.message);
    return <div className="p-8 text-center text-red-500">Gagal memuat lowongan. Silakan coba lagi.</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="items-start justify-between md:flex">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Lowongan Magang Tersedia</h1>
            <p className="mt-2 text-lg text-gray-600">Temukan peluang terbaik untuk memulai karirmu.</p>
          </div>
          <div className="mt-4 md:mt-0 flex-shrink-0">
            {/* 5. Terapkan gaya input yang konsisten */}
            <input 
              type="text" 
              placeholder="🔍 Cari lowongan..."
              className="w-full rounded-md border-gray-300 p-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 md:w-72"
            />
          </div>
        </div>

        <div className="mt-8">
          {listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {listings.map(listing => (
                <ListingCard key={listing.id} listing={{...listing, companies: Array.isArray(listing.companies) ? listing.companies[0] : listing.companies}} />
              ))}
            </div>
          ) : (
             // 6. Tampilan placeholder yang lebih baik
            <div className="text-center rounded-lg border-2 border-dashed border-gray-300 p-12 mt-12 bg-white">
              <div className="flex justify-center">
                <Inbox className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Belum Ada Lowongan</h3>
              <p className="mt-1 text-sm text-gray-500">Saat ini belum ada lowongan yang tersedia. Silakan cek kembali nanti.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}