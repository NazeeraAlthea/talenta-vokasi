// app/siswa/dashboard/page.tsx

import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Inbox } from 'lucide-react';
import CategoryFilter from '@/components/ui/CategoryFilter'; // <-- 1. Import komponen filter

// Tipe data & Komponen ListingCard tidak berubah...
type Listing = {
    id: string;
    title: string;
    location: string;
    companies: { name: string; logo_url: string | null; } | null;
};
const ListingCard = ({ listing }: { listing: Listing }) => {
    const companyName = listing.companies?.name || 'Perusahaan';
    const initial = companyName.charAt(0).toUpperCase() || '?';
    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <div className="flex-grow">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        {listing.companies?.logo_url ? <Image width={48} height={48} className="h-12 w-12 rounded-full object-cover" src={listing.companies.logo_url} alt={`${companyName} logo`} /> : <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">{initial}</div>}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600"><Link href={`/lowongan/${listing.id}`}>{listing.title}</Link></h3>
                        <p className="text-sm font-medium text-gray-700">{companyName}</p>
                        <p className="mt-1 text-sm text-gray-500">{listing.location}</p>
                    </div>
                </div>
            </div>
            <div className="mt-5 flex items-center justify-end">
                <Link href={`/lowongan/${listing.id}/lamar`} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Lamar Sekarang</Link>
            </div>
        </div>
    );
};


// 2. Ubah signature fungsi untuk menerima searchParams
export default async function SiswaDashboardPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const supabase = createServerComponentClient({ cookies });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // 3. Ambil daftar kategori pekerjaan & kategori yang dipilih dari URL
  const { data: categories } = await supabase.from('job_categories').select('id, name').order('name');
  const selectedCategory = searchParams?.category;

  // 4. Bangun query Supabase secara dinamis
  let query = supabase
    .from('listings')
    .select(`id, title, location, companies!inner(name, logo_url)`)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // Jika ada kategori yang dipilih (dan bukan 'all'), tambahkan filter
  if (selectedCategory && selectedCategory !== 'all') {
    query = query.eq('category_id', selectedCategory);
  }

  // Eksekusi query
  const { data: listings, error } = await query;

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
            {/* 5. Ganti input dengan komponen filter kategori */}
            <CategoryFilter categories={categories || []} />
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
            <div className="text-center rounded-lg border-2 border-dashed border-gray-300 p-12 mt-12 bg-white">
              <div className="flex justify-center"><Inbox className="h-12 w-12 text-gray-400" /></div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Lowongan Tidak Ditemukan</h3>
              <p className="mt-1 text-sm text-gray-500">Coba pilih kategori lain atau tampilkan semua kategori.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}