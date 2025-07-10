import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import ListingCard from '@/components/ui/ListingCard';
import CategoryFilter from '@/components/ui/CategoryFilter';
import { Inbox } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';

export default async function PublicListingsPage({
    searchParams,
}: {
    searchParams?: { category?: string };
}) {
    const supabase = createServerComponentClient({ cookies });

    // Ambil data sesi untuk ditampilkan di header
    const { data: { session } } = await supabase.auth.getSession();

    // Fetch categories for the filter
    const { data: categories } = await supabase.from('job_categories').select('id, name').order('name');
    const selectedCategory = searchParams?.category;

    // Build the query dynamically
    let query = supabase
        .from('listings')
        .select(`id, title, location, companies(name, logo_url)`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
    }

    const { data: listings, error } = await query;

    if (error) {
        console.error("Error fetching public listings:", error.message);
        return <div className="p-8 text-center text-red-500">Gagal memuat lowongan. Silakan coba lagi.</div>;
    }

    return (
        <>
            <PublicHeader session={session} />
            <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <div className="items-start justify-between md:flex">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Semua Lowongan</h1>
                            <p className="mt-2 text-lg text-gray-600">Jelajahi semua peluang yang tersedia.</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex-shrink-0">
                            <CategoryFilter categories={categories || []} />
                        </div>
                    </div>

                    <div className="mt-8">
                        {listings && listings.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {listings.map(listing => {
                                    // Membersihkan struktur data sebelum dikirim ke komponen Card
                                    const cleanListing = {
                                        ...listing,
                                        companies: Array.isArray(listing.companies) ? listing.companies[0] : listing.companies,
                                    };
                                    return (
                                        <ListingCard
                                            key={listing.id}
                                            listing={cleanListing}
                                            actionSlot={
                                                <Link href={`/lowongan/${listing.id}`} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                                                    Lihat Detail
                                                </Link>
                                            }
                                        />
                                    );
                                })}
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
        </>
    );
}