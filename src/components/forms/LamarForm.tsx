"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Tipe data untuk props yang diterima dari Server Component
type ListingData = {
  id: string;
  title: string;
  companies: { name: string } | null;
};
type StudentData = {
  full_name: string;
  schools: { name: string } | null;
};

type LamarFormProps = {
  listing: ListingData;
  student: StudentData;
};

export default function LamarForm({ listing, student }: LamarFormProps) {
  const router = useRouter();
  const [coverLetter, setCoverLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listing.id,
          cover_letter: coverLetter,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal mengirim lamaran.");
      }

      alert('Lamaran Anda berhasil dikirim!');
      // Arahkan ke halaman daftar lamaran (perlu dibuat) atau dashboard
      router.push('/siswa/dashboard');
      router.refresh();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6 rounded-md border p-6">
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
          <p className="text-xs text-gray-500 mt-1">*Profil lengkap Anda akan dilampirkan secara otomatis.</p>
        </div>
        <hr/>
        <div>
          <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700">
            Pesan Pengantar (Opsional)
          </label>
          <textarea
            id="coverLetter"
            name="coverLetter"
            rows={4}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="mt-1 block w-full rounded-md bg-slate-50 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Tulis pesan singkat untuk menonjolkan diri Anda kepada perekrut..."
          />
        </div>
      </div>

      {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="ml-4 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
        >
          {isLoading ? 'Mengirim...' : 'Kirim Lamaran Sekarang'}
        </button>
      </div>
    </form>
  );
}