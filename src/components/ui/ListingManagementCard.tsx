// components/ui/ListingManagementCard.tsx

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as Switch from '@radix-ui/react-switch';
import { Users, Edit } from 'lucide-react';
import supabase from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

// Tipe data dari props
type Listing = {
  id: string;
  title: string;
  is_active: boolean;
  applications: { count: number }[];
};

export default function ListingManagementCard({ listing }: { listing: Listing }) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(listing.is_active);
  const [isToggling, setIsToggling] = useState(false);

  const applicantCount = listing.applications[0]?.count || 0;

  const handleStatusToggle = async (checked: boolean) => {
    setIsToggling(true);
    const { error } = await supabase
      .from('listings')
      .update({ is_active: checked })
      .eq('id', listing.id);
    
    if (error) {
      toast.error("Gagal mengubah status lowongan.");
    } else {
      toast.success(`Lowongan ${checked ? 'diaktifkan' : 'dinonaktifkan'}.`);
      setIsActive(checked);
      router.refresh(); // Refresh data di server component
    }
    setIsToggling(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between gap-4">
      <div>
        <div className="flex justify-between items-start">
          <p className="text-lg font-semibold text-gray-900 pr-4">{listing.title}</p>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700" htmlFor={`active-toggle-${listing.id}`}>
              {isActive ? 'Aktif' : 'Nonaktif'}
            </label>
            <Switch.Root
              id={`active-toggle-${listing.id}`}
              checked={isActive}
              onCheckedChange={handleStatusToggle}
              disabled={isToggling}
              className="w-[42px] h-[25px] bg-gray-300 rounded-full relative data-[state=checked]:bg-indigo-600 outline-none cursor-pointer transition-colors"
            >
              <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-sm transition-transform duration-100 translate-x-0.5 data-[state=checked]:translate-x-[19px]" />
            </Switch.Root>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-500 mt-2">
          <Users className="flex-shrink-0 mr-1.5 h-4 w-4" />
          <span>{applicantCount} Pelamar</span>
        </div>
      </div>
      <div className="border-t pt-4 mt-4 flex items-center justify-end gap-3">
        <Link href={`/perusahaan/lowongan/${listing.id}/pelamar`} className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          Lihat Pelamar
        </Link>
        <Link href={`/perusahaan/lowongan/${listing.id}/edit`} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
          <Edit size={16} /> Edit
        </Link>
      </div>
    </div>
  );
}