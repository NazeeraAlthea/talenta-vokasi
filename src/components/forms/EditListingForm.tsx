// components/forms/EditListingForm.tsx

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import { Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Tipe data untuk props
type Listing = {
  id: string;
  title: string;
  description: string;
  location: string;
  category_id: string;
};
type Category = {
  id: string;
  name: string;
};
type FormProps = {
  listing: Listing;
  categories: Category[];
};

export default function EditListingForm({ listing, categories }: FormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: listing.title,
    description: listing.description,
    location: listing.location,
    category_id: listing.category_id,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('listings')
        .update(formData)
        .eq('id', listing.id);

      if (updateError) throw updateError;

      toast.success('Lowongan berhasil diperbarui!');
      router.push('/perusahaan/dashboard');
      router.refresh();

    } catch (err: any) {
      setError(err.message);
      toast.error('Gagal menyimpan perubahan.');
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyle = "w-full rounded-md border-gray-300 p-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Judul Posisi</label>
        <input type="text" name="title" id="title" required value={formData.title} onChange={handleInputChange} className={inputStyle} />
      </div>

      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">Kategori Pekerjaan</label>
        <select name="category_id" id="category_id" required value={formData.category_id} onChange={handleInputChange} className={inputStyle}>
          <option value="" disabled>-- Pilih Kategori --</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
        <input type="text" name="location" id="location" required placeholder="Cth: Jakarta Selatan (Remote)" value={formData.location} onChange={handleInputChange} className={inputStyle} />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Pekerjaan</label>
        <textarea name="description" id="description" rows={8} required value={formData.description} onChange={handleInputChange} className={inputStyle} />
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4"><div className="flex"><div className="flex-shrink-0"><AlertCircle className="h-5 w-5 text-red-400" /></div><div className="ml-3"><p className="text-sm font-medium text-red-800">{error}</p></div></div></div>
      )}

      <div className="flex justify-end gap-4 pt-6 border-t">
        <button type="button" onClick={() => router.back()} className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          Batal
        </button>
        <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400">
          {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
}