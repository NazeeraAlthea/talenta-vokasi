"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Edit, Building, Hash, Award, MapPin, Mail } from 'lucide-react';

// Tipe data untuk props
type SchoolProfile = {
  name: string;
  npsn: string;
  accreditation: string;
  level: string;
  address: string | null;
  logo_url: string | null;
};
type ProfileProps = {
  school: SchoolProfile;
  email: string;
};

export default function SekolahProfileClient({ school, email }: ProfileProps) {
  const schoolInitial = school.name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
      {/* Header Profil */}
      <div className="p-6 sm:p-8 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-start gap-6">
        <div className="flex items-center gap-6">
          {school.logo_url ? (
            <Image src={school.logo_url} alt={`Logo ${school.name}`} width={80} height={80} className="rounded-full object-cover ring-4 ring-white" />
          ) : (
            <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-3xl ring-4 ring-white">
              {schoolInitial}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{school.name}</h1>
            <p className="mt-1 text-md text-gray-600">
              Akreditasi <span className="font-semibold text-indigo-600">{school.accreditation}</span>
            </p>
          </div>
        </div>
        <Link 
          href="/sekolah/profil/edit" 
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          <Edit className="h-4 w-4" />
          Edit Profil
        </Link>
      </div>

      {/* Detail Informasi */}
      <div className="p-6 sm:p-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Detail Sekolah</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
          <div>
            <dt className="flex items-center gap-2 text-sm font-medium text-gray-500"><Hash size={16} /> NPSN</dt>
            <dd className="mt-1 text-base text-gray-900">{school.npsn}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-2 text-sm font-medium text-gray-500"><Award size={16} /> Jenjang Pendidikan</dt>
            <dd className="mt-1 text-base text-gray-900">{school.level}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="flex items-center gap-2 text-sm font-medium text-gray-500"><MapPin size={16} /> Alamat</dt>
            <dd className="mt-1 text-base text-gray-900">{school.address || 'Belum diatur'}</dd>
          </div>
           <div className="sm:col-span-2">
            <dt className="flex items-center gap-2 text-sm font-medium text-gray-500"><Mail size={16} /> Email Kontak PIC</dt>
            <dd className="mt-1 text-base text-gray-900">{email}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}