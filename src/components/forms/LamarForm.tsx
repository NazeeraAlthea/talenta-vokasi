// components/forms/LamarForm.tsx

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast'; // <-- Import toast

type ListingData = { id: string; title: string; companies: { name: string } | null; };
type StudentData = { full_name: string; cv_url: string | null; schools: { name: string } | null; };
type LamarFormProps = { listing: ListingData; student: StudentData; };

export default function LamarForm({ listing, student }: LamarFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasCv = student.cv_url && student.cv_url.length > 0;

  const handleSubmit = async () => {
    if (!hasCv) return; 
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listing.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Terjadi kesalahan saat mengirim lamaran.");
      
      // Ganti alert dengan toast.success
      toast.success('Lamaran Anda berhasil dikirim!');

      router.push('/siswa/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Detail Lamaran dengan gaya yang disempurnakan */}
      <div className="space-y-5 rounded-lg border bg-slate-50 p-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Posisi Dilamar</h3>
          <p className="text-xl font-semibold text-indigo-600">{listing.title}</p>
          <p className="text-md text-gray-800">di {listing.companies?.name || 'Perusahaan'}</p>
        </div>
        <div className="border-t border-gray-200"></div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Profil Pengirim</h3>
          <p className="text-xl font-semibold text-gray-900">{student.full_name}</p>
          <p className="text-md text-gray-800">dari {student.schools?.name || 'Sekolah'}</p>
        </div>
      </div>

      {/* Bagian Pengecekan CV */}
      <div className="mt-6">
        {hasCv ? (
          // Tampilan jika CV ada (dibuat lebih informatif)
          <div className="rounded-md border border-green-300 bg-green-50 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-green-800">CV Anda Siap!</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>CV Anda akan otomatis disertakan dalam lamaran ini.</p>
                </div>
                <div className="mt-3">
                  <Link href="/siswa/profil/edit" className="text-sm font-medium text-green-800 hover:text-green-900 underline">
                    Ganti CV
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Tampilan jika CV tidak ada (sudah baik, tidak ada perubahan)
          <div className="rounded-md border border-orange-300 bg-orange-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-orange-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">CV Belum Diunggah</h3>
                <div className="mt-2 text-sm text-orange-700">
                  <p>Anda harus mengunggah CV di halaman profil sebelum dapat melamar.</p>
                </div>
                <div className="mt-4">
                  <Link href="/siswa/profil/edit" className="rounded-md bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">
                    Upload CV Sekarang
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pesan Error dengan gaya yang disempurnakan */}
      {error && 
        <div className="mt-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      }

      {/* Tombol Aksi di bawah (gaya sudah baik, tidak ada perubahan) */}
      <div className="mt-8 flex justify-end gap-4 border-t pt-6">
        <button type="button" onClick={() => router.back()} className="rounded-md bg-white px-6 py-2.5 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          Kembali
        </button>
        <button 
          onClick={handleSubmit} 
          disabled={!hasCv || isLoading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2.5 px-6 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          title={!hasCv ? "Harap unggah CV Anda terlebih dahulu" : ""}
        >
          {isLoading ? 'Mengirim...' : 'Kirim Lamaran'}
        </button>
      </div>
    </div>
  );
}