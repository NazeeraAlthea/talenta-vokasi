import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import ListingCard from '@/components/ui/ListingCard';

export default async function PublicListingsPage() {
    const supabase = createServerComponentClient({ cookies });

    const { data: listings } = await supabase
        .from('listings')
        .select(`id, title, location, companies(name, logo_url)`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-5xl">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Semua Lowongan</h1>
                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {listings?.map(listing => (
                        <ListingCard 
                            key={listing.id} 
                            listing={{...listing, companies: Array.isArray(listing.companies) ? listing.companies[0] : listing.companies}}
                            // Tombol aksinya sederhana, hanya link ke detail
                            actionSlot={
                                <Link href={`/lowongan/${listing.id}`} className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                    Lihat Detail
                                </Link>
                            }
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}