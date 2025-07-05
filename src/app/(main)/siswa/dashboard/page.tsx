"use client";

import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../lib/supabaseClient';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';

// Tipe data untuk lowongan, termasuk nama perusahaan dari tabel 'companies'
type Listing = {
  id: string;
  title: string;
  description: string;
  location: string;
  type: 'MAGANG' | 'KERJA_PENUH_WAKTU' | 'KERJA_PARUH_WAKTU';
  companies: {
    name: string;
    logo_url: string | null;
  } | null;
};

// Komponen untuk kartu lowongan
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
        <h3 className="text-lg font-semibold text-blue-600 hover:underline">
          <Link href={`/lowongan/${listing.id}`}>{listing.title}</Link>
        </h3>
        <p className="text-sm font-medium text-gray-800">{listing.companies?.name || 'Nama Perusahaan'}</p>
        <p className="mt-1 text-sm text-gray-500">{listing.location}</p>
      </div>
    </div>
    <div className="mt-4 flex items-center justify-between">
      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
        {listing.type.replace(/_/g, ' ')}
      </span>
      <Link href={`/lowongan/${listing.id}/lamar`} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
        Lamar
      </Link>
    </div>
  </div>
);


export default function SiswaDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Gagal memuat sesi pengguna.");
      setLoading(false);
      return;
    }
    setUser(user);

    const { data, error } = await supabase
      .from('listings')
      .select(`
        id,
        title,
        description,
        location,
        type,
        companies ( name, logo_url )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      setError(`Gagal memuat lowongan: ${error.message}`);
    } else if (data) {
      // PERUBAHAN DI SINI: Transformasi data manual
      const formattedData = data.map(listing => ({
        ...listing,
        // Mengubah 'companies' dari array menjadi objek tunggal atau null
        companies: Array.isArray(listing.companies) && listing.companies.length > 0 
                   ? listing.companies[0] 
                   : listing.companies,
      }));
      setListings(formattedData as Listing[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Memuat lowongan...</div>;
  }
  
  if (error) {
    return <div className="flex h-screen items-center justify-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="items-center justify-between md:flex">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lowongan Tersedia</h1>
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
          {listings.length > 0 ? (
            listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
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
