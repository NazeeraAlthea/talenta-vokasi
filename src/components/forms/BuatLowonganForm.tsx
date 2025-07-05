"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type JobCategory = {
  id: string;
  name: string;
};

type BuatLowonganFormProps = {
  categories: JobCategory[];
};

// DIHAPUS: 'type' dari FormData
type FormData = {
  title: string;
  description: string;
  location: string;
  category_id: string;
};

export default function BuatLowonganForm({ categories }: BuatLowonganFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    location: '',
    category_id: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.category_id) {
      setError('Kategori pekerjaan harus dipilih.');
      return;
    }

    setLoading(true);

    try {
      // Data yang dikirim sudah tidak mengandung 'type'
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal membuat lowongan.');
      }

      alert('Lowongan magang berhasil dibuat!');
      router.push('/perusahaan/dashboard');
      router.refresh();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "mt-1 block w-full rounded-md bg-slate-100 border-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Judul Posisi Magang</label>
        {/* DIUBAH: Class untuk input lebih gelap */}
        <input type="text" name="title" id="title" required value={formData.title} onChange={handleChange} className={inputClasses} />
      </div>

      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Kategori Pekerjaan</label>
        <select name="category_id" id="category_id" required value={formData.category_id} onChange={handleChange} className={inputClasses}>
          <option value="" disabled>-- Pilih Kategori --</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      {/* DIHAPUS: Blok JSX untuk dropdown tipe lowongan */}

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Lokasi</label>
        <input type="text" name="location" id="location" required placeholder="Cth: Jakarta Selatan (Remote)" value={formData.location} onChange={handleChange} className={inputClasses} />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi Pekerjaan</label>
        <textarea name="description" id="description" rows={6} required value={formData.description} onChange={handleChange} className={inputClasses} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
          {loading ? 'Memproses...' : 'Publikasikan Lowongan'}
        </button>
      </div>
    </form>
  );
}