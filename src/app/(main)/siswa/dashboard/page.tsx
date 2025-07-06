// DIUBAH: Halaman ini sekarang adalah Server Component (tanpa "use client")
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';

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

// Komponen ListingCard tetap sama, bisa diletakkan di file ini atau diimpor
const ListingCard = ({ listing }: { listing: Listing }) => (
  <div className="rounded-lg border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        {listing.companies?.logo_url ? (
          <img className="h-12 w-12 rounded-full object-cover" src={listing.companies.logo_url} alt={`${listing.companies.name} logo`} />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-bold text-gray-500">
            {listing.companies?.name?.charAt(0) || '?'}
          </div>
        )}
      </div>
      <div className="ml-4 flex-1">
        <h3 className="text-lg font-semibold text-indigo-600 hover:underline">
          <Link href={`/lowongan/${listing.id}`}>{listing.title}</Link>
        </h3>
        <p className="text-sm font-medium text-gray-800">{listing.companies?.name || 'Nama Perusahaan'}</p>
        <p className="mt-1 text-sm text-gray-500">{listing.location}</p>
      </div>
    </div>
    <div className="mt-4 flex items-center justify-end">
      <Link href={`/lowongan/${listing.id}/lamar`} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
        Lamar Sekarang
      </Link>
    </div>
  </div>
);


// Fungsi utama halaman sekarang menjadi 'async'
export default async function SiswaDashboardPage() {
  const supabase = createServerComponentClient({ cookies });

  // 1. Ambil sesi pengguna di server
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // 2. Ambil data lowongan langsung di server
  const { data: listings, error } = await supabase
    .from('listings')
    .select(`
      id,
      title,
      location,
      companies ( name, logo_url )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching listings:", error.message);
    return <div className="p-8 text-red-500">Gagal memuat lowongan. Silakan coba lagi.</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="items-center justify-between md:flex">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lowongan Magang Tersedia</h1>
            <p className="mt-1 text-lg text-gray-600">Temukan peluang terbaik untuk karirmu.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <input 
              type="text" 
              placeholder="🔍 Cari lowongan atau perusahaan..."
              className="w-full rounded-md border-gray-300 shadow-sm md:w-auto"
            />
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {listings && listings.length > 0 ? (
            listings.map(listing => (
              // Perlu penyesuaian tipe data karena Supabase bisa mengembalikan array untuk relasi
              <ListingCard key={listing.id} listing={{...listing, companies: Array.isArray(listing.companies) ? listing.companies[0] : listing.companies}} />
            ))
          ) : (
            <div className="text-center rounded-lg border-2 border-dashed border-gray-300 p-12">
              <h3 className="text-lg font-medium text-gray-900">Belum Ada Lowongan</h3>
              <p className="mt-1 text-sm text-gray-500">Saat ini belum ada lowongan yang tersedia. Silakan cek kembali nanti.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}