import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Building, BookCopy, Bookmark } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader'; // Impor Header Publik

async function getListing(id: string) {
    // Pola yang benar untuk membuat client di Server Component
    const supabase = createServerComponentClient({ cookies });

    const { data } = await supabase
        .from('listings')
        .select(`*, companies (*), job_categories (name)`)
        .eq('id', id)
        .eq('is_active', true)
        .single();
    
    if (!data) {
        notFound();
    }

    const cleanData = {
        ...data,
        companies: Array.isArray(data.companies) ? data.companies[0] : data.companies,
        job_categories: Array.isArray(data.job_categories) ? data.job_categories[0] : data.job_categories,
        majors: Array.isArray(data.majors) ? data.majors[0] : data.majors,
    };
    return cleanData;
}

export default async function ListingDetailPage({ params }: { params: { listingId: string } }) {
    const listing = await getListing(params.listingId);
    const companyName = listing.companies?.name || 'Perusahaan';
    const companyInitial = companyName.charAt(0) || '?';

    // Ambil sesi untuk header
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Gunakan Header Publik yang sama dengan halaman utama */}
            <PublicHeader session={session} />

            <main className="pt-16"> {/* Beri padding atas agar tidak tertutup header */}
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                        
                        {/* Kolom Kiri: Konten Utama */}
                        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-200">
                            <div className="flex items-start gap-5">
                                <div className="flex-shrink-0">
                                    {listing.companies?.logo_url ? (
                                        <Image src={listing.companies.logo_url} alt={`${companyName} logo`} width={64} height={64} className="rounded-lg object-cover" />
                                    ) : (
                                        <div className="w-16 h-16 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 font-bold text-2xl">{companyInitial}</div>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">{listing.title}</h1>
                                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-600">
                                        <p className="flex items-center gap-1.5"><Building size={16} /> {companyName}</p>
                                        <p className="flex items-center gap-1.5"><MapPin size={16} /> {listing.location}</p>
                                    </div>
                                </div>
                            </div>
                            <hr className="my-8" />
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Deskripsi Pekerjaan</h2>
                                <div className="prose prose-indigo max-w-none text-gray-700 whitespace-pre-wrap">{listing.description}</div>
                            </div>
                        </div>

                        {/* Kolom Kanan: Ringkasan & Tombol Aksi */}
                        <div className="mt-8 lg:mt-0">
                            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 sticky top-24">
                                <h2 className="text-lg font-semibold text-gray-900">Ringkasan Lowongan</h2>
                                <dl className="mt-4 space-y-4">
                                    <div className="flex justify-between"><dt className="flex items-center gap-2 text-sm text-gray-500"><Bookmark size={16} /> Kategori</dt><dd className="text-sm font-medium text-gray-900">{listing.job_categories?.name || 'Lainnya'}</dd></div>
                                </dl>
                                <div className="mt-6">
                                    <Link href={`/lowongan/${listing.id}/lamar`} className="w-full flex justify-center rounded-md bg-indigo-600 px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700">Lamar Sekarang</Link>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}