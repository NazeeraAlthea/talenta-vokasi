"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, AlertTriangle } from 'lucide-react';

// Tipe data props tetap sama
type ListingData = { id: string; title: string; companies: { name: string } | null; };
type StudentData = { full_name: string; cv_url: string | null; schools: { name: string } | null; };
type LamarFormProps = { listing: ListingData; student: StudentData; };

export default function LamarClientComponent({ listing, student }: LamarFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasCv = student.cv_url && student.cv_url.length > 0;

  const handleSubmit = async () => {
    // ... (Fungsi handleSubmit tidak berubah)
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
      if (!response.ok) throw new Error(result.error);
      alert('Lamaran Anda berhasil dikirim!');
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
      {/* Detail Lamaran (tidak berubah) */}
      <div className="space-y-4 rounded-md border p-6">
        <div>
          <h3 className="font-medium text-gray-500">Anda melamar untuk posisi:</h3>
          <p className="text-xl font-semibold text-indigo-600">{listing.title}</p>
          <p className="text-md text-gray-800">di {listing.companies?.name || 'Perusahaan'}</p>
        </div>
        <hr/>
        <div>
          <h3 className="font-medium text-gray-500">Profil pengirim:</h3>
          <p className="text-xl font-semibold text-gray-900">{student.full_name}</p>
          <p className="text-md text-gray-800">dari {student.schools?.name || 'Sekolah'}</p>
        </div>
      </div>

      {/* Bagian Pengecekan CV (tidak berubah) */}
      <div className="mt-6">
        {hasCv ? (
          <div className="rounded-md border-2 border-dashed border-green-300 bg-green-50 p-4">
            {/* Tampilan jika CV ada (tidak berubah) */}
          </div>
        ) : (
          // ✨ DIUBAH: Menambahkan tombol aksi langsung di dalam kartu peringatan
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

      {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}

      {/* ✨ DIUBAH: Tombol Aksi di bawah sekarang hanya satu dan dinonaktifkan jika tidak ada CV */}
      <div className="mt-8 flex justify-end gap-4">
        <button type="button" onClick={() => router.back()} className="rounded-md bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          Kembali
        </button>
        <button 
          onClick={handleSubmit} 
          disabled={!hasCv || isLoading} // Tombol dinonaktifkan jika tidak ada CV atau sedang loading
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          title={!hasCv ? "Harap unggah CV Anda terlebih dahulu" : ""}
        >
          {isLoading ? 'Mengirim...' : 'Kirim Lamaran'}
        </button>
      </div>
    </div>
  );
}