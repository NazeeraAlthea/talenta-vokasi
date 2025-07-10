// components/ui/PerusahaanProfileClient.tsx

"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Building, Globe, Mail, MapPin, Edit } from 'lucide-react';

// Tipe data untuk props yang diterima dari server component
type CompanyProfile = {
  name: string;
  industry: string | null;
  website: string | null;
  address: string | null;
  logo_url: string | null;
};

type ProfileProps = {
  company: CompanyProfile;
  email: string;
};

export default function PerusahaanProfileClient({ company, email }: ProfileProps) {
  const initial = company.name?.charAt(0).toUpperCase() || 'P';

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header Profil */}
      <div className="p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="flex-shrink-0">
              {company.logo_url ? (
                <Image
                  src={company.logo_url}
                  alt={`Logo ${company.name}`}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-white"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-3xl font-bold text-indigo-600 ring-4 ring-white">
                  {initial}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
              <p className="text-md text-gray-600 mt-1">{company.industry || 'Industri Belum Diatur'}</p>
            </div>
          </div>
          <div className="flex-shrink-0 w-full sm:w-auto">
            <Link href="/perusahaan/profil/edit" className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
              <Edit className="h-4 w-4" />
              Edit Profil
            </Link>
          </div>
        </div>
      </div>

      {/* Detail Informasi */}
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Detail Perusahaan</h3>
          <dl className="space-y-4">
            <div className="flex gap-4">
              <dt className="flex-shrink-0"><Mail className="h-5 w-5 text-gray-400" /></dt>
              <dd className="text-sm text-gray-900">{email}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="flex-shrink-0"><MapPin className="h-5 w-5 text-gray-400" /></dt>
              <dd className="text-sm text-gray-900">{company.address || 'Alamat belum ditambahkan'}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="flex-shrink-0"><Globe className="h-5 w-5 text-gray-400" /></dt>
              <dd className="text-sm">
                {company.website ? (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                    {company.website}
                  </a>
                ) : (
                  <span className="text-gray-900">Website belum ditambahkan</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}