"use client";

import Link from 'next/link';
import { User, FileText, Edit, Link2, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

// Tipe data untuk status verifikasi
type VerificationStatus = 'PENDING' | 'VERIFIED_BY_SCHOOL' | 'REJECTED';

// Tipe data untuk props, DITAMBAHKAN verification_status
type StudentProfile = {
  full_name: string;
  nisn: string;
  cv_url: string | null;
  portfolio_url: string | null;
  verification_status: VerificationStatus; // <-- DITAMBAHKAN
  schools: { name: string; } | null;
  majors: { name: string; } | null;
};

type ProfileProps = {
  student: StudentProfile;
  email: string;
};

// Komponen Badge Baru untuk Status Verifikasi
const VerificationStatusBadge = ({ status }: { status: VerificationStatus }) => {
  const statusInfo = {
    PENDING: { text: 'Menunggu Verifikasi Sekolah', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    VERIFIED_BY_SCHOOL: { text: 'Terverifikasi oleh Sekolah', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    REJECTED: { text: 'Verifikasi Ditolak', color: 'bg-red-100 text-red-800', icon: XCircle },
  };

  const currentStatus = statusInfo[status] || statusInfo.PENDING;
  const Icon = currentStatus.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${currentStatus.color}`}>
      <Icon size={14} />
      {currentStatus.text}
    </span>
  );
};


export default function SiswaProfileClient({ student, email }: ProfileProps) {

  const getFileNameFromUrl = (url: string) => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const path = new URL(decodedUrl).pathname;
      return path.substring(path.lastIndexOf('/') + 1);
    } catch (e) {
      return "file_cv.pdf";
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header Profil */}
      <div className="p-6 border-b flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{student.full_name}</h1>
          <p className="text-md text-gray-600 mt-1">{student.majors?.name || 'Jurusan Belum Diatur'}</p>
          <p className="text-sm text-gray-500">{student.schools?.name || 'Sekolah Belum Diatur'}</p>
          {/* BADGE STATUS DITAMPILKAN DI SINI */}
          <div className="mt-4">
            <VerificationStatusBadge status={student.verification_status} />
          </div>
        </div>
        <Link href="/siswa/profil/edit" className="flex-shrink-0 inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          <Edit className="h-4 w-4" />
          Edit Profil
        </Link>
      </div>

      {/* Detail Informasi */}
      <div className="p-6 space-y-6">
        {/* ... sisa kode tidak berubah ... */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Informasi Dasar</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
            <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500">Nama Lengkap</dt><dd className="mt-1 text-sm text-gray-900">{student.full_name}</dd></div>
            <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500">NISN</dt><dd className="mt-1 text-sm text-gray-900">{student.nisn}</dd></div>
            <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500">Email</dt><dd className="mt-1 text-sm text-gray-900">{email}</dd></div>
            <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500">Asal Sekolah</dt><dd className="mt-1 text-sm text-gray-900">{student.schools?.name || '-'}</dd></div>
          </dl>
        </div>
        <hr/>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Dokumen & Portofolio</h3>
          <div className="space-y-4">
            {student.cv_url ? (
              <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-3"><CheckCircle className="h-6 w-6 text-green-600" /><div><p className="font-semibold text-green-800">CV Sudah Diunggah</p><p className="text-sm text-green-700">{getFileNameFromUrl(student.cv_url)}</p></div></div>
                <div><a href={student.cv_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600 hover:underline mr-4">Lihat</a><Link href="/siswa/profil/edit" className="text-sm font-medium text-indigo-600 hover:underline">Ganti</Link></div>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-4">
                <div className="flex items-center gap-3"><AlertCircle className="h-6 w-6 text-orange-500" /><p className="font-semibold text-orange-800">CV Belum Diunggah</p></div>
                <Link href="/siswa/profil/edit" className="rounded-md bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600">Upload Sekarang</Link>
              </div>
            )}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3"><Link2 className="h-6 w-6 text-gray-500" /><p className="font-semibold text-gray-800">Link Portofolio</p></div>
              {student.portfolio_url ? <a href={student.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600 hover:underline">Lihat Portofolio</a> : <Link href="/siswa/profil/edit" className="text-sm font-medium text-indigo-600 hover:underline">Tambahkan Link</Link>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}