// components/forms/BuatLowonganForm.tsx

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react'; // Import ikon
import toast from 'react-hot-toast';

type JobCategory = {
  id: string;
  name: string;
};

type BuatLowonganFormProps = {
  categories: JobCategory[];
};

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
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal membuat lowongan.');
      }

      toast.success('Lowongan magang berhasil dibuat!');
      router.push('/perusahaan/dashboard');
      router.refresh();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Standarisasi gaya input dan button
  const inputStyle = "w-full rounded-md border-gray-300 p-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500";
  const buttonStyle = "inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Judul Posisi</label>
        <input type="text" name="title" id="title" required value={formData.title} onChange={handleChange} className={inputStyle} />
      </div>

      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">Kategori Pekerjaan</label>
        <select name="category_id" id="category_id" required value={formData.category_id} onChange={handleChange} className={inputStyle}>
          <option value="" disabled>-- Pilih Kategori --</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
        <input type="text" name="location" id="location" required placeholder="Cth: Jakarta Selatan (Remote)" value={formData.location} onChange={handleChange} className={inputStyle} />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Pekerjaan</label>
        <textarea name="description" id="description" rows={6} required value={formData.description} onChange={handleChange} className={inputStyle} />
      </div>
      
      {/* Pesan Error dengan gaya baru */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button type="submit" disabled={loading} className={buttonStyle}>
          {loading ? 'Memproses...' : 'Publikasikan Lowongan'}
        </button>
      </div>
    </form>
  );
}