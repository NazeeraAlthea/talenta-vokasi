// components/forms/EditPerusahaanForm.tsx

"use client";

import { useState, DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient'; 
import { Loader2, UploadCloud, FileImage, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

// Tipe data untuk props
type Company = { 
  id: string; 
  user_id: string; 
  name: string; 
  industry: string | null;
  website: string | null;
  address: string | null;
  logo_url: string | null;
};
// Tipe baru untuk kategori yang diterima dari props
type Category = {
  name: string;
};
type FormProps = { 
  company: Company; 
  categories: Category[]; // <-- 1. Menerima props 'categories'
};

export default function EditPerusahaanForm({ company, categories }: FormProps) {
    const router = useRouter();

    const [formData, setFormData] = useState({
        industry: company.industry || '',
        website: company.website || '',
        address: company.address || '',
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [currentLogoUrl, setCurrentLogoUrl] = useState(company.logo_url);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileSelect = (files: FileList | null) => {
        if (files && files[0]) {
            if (!files[0].type.startsWith("image/")) { setError("Hanya file gambar yang diizinkan."); return; }
            if (files[0].size > 2 * 1024 * 1024) { setError("Ukuran file maksimal 2MB."); return; }
            setError(null);
            setLogoFile(files[0]);
            setCurrentLogoUrl(URL.createObjectURL(files[0]));
        }
    };

    const handleDrag = (e: DragEvent<HTMLDivElement>) => { 
      e.preventDefault(); e.stopPropagation(); 
      if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true);
      else if (e.type === "dragleave") setIsDragActive(false);
    };
    
    const handleDrop = (e: DragEvent<HTMLDivElement>) => { 
      e.preventDefault(); e.stopPropagation(); 
      setIsDragActive(false); 
      handleFileSelect(e.dataTransfer.files); 
    };
    
    const handleSubmit = async () => {
        setIsSaving(true);
        setError(null);
        let updatedLogoUrl = company.logo_url;

        try {
            if (logoFile) {
                const filePath = `${company.user_id}/${Date.now()}_${logoFile.name}`;
                const { error: uploadError } = await supabase.storage.from('logos').upload(filePath, logoFile, { upsert: true });
                if (uploadError) throw new Error(`Gagal mengunggah logo: ${uploadError.message}`);
                
                const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(filePath);
                updatedLogoUrl = publicUrl;
            }

            const { error: updateError } = await supabase
              .from('companies')
              .update({ ...formData, logo_url: updatedLogoUrl })
              .eq('id', company.id);

            if (updateError) throw updateError;

            toast.success('Profil perusahaan berhasil diperbarui!');
            
            router.push('/perusahaan/profil');
            router.refresh();

        } catch (err: any) {
            setError(err.message);
            toast.error("Gagal menyimpan perubahan.");
        } finally {
            setIsSaving(false);
        }
    };

    const inputStyle = "w-full rounded-md border-gray-300 p-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500";
    const disabledInputStyle = "w-full rounded-md border-gray-300 bg-gray-100 p-3 text-gray-500 shadow-sm cursor-not-allowed";

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Perusahaan</label>
                    <input type="text" name="name" id="name" value={company.name} className={disabledInputStyle} disabled />
                </div>
                
                {/* --- 2. Input diubah menjadi Select/Dropdown --- */}
                <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700">Industri</label>
                    <select 
                      name="industry" 
                      id="industry" 
                      value={formData.industry} 
                      onChange={handleInputChange} 
                      className={inputStyle}
                    >
                      <option value="" disabled>-- Pilih Industri --</option>
                      {categories.map((cat) => (
                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                </div>
                {/* ------------------------------------------- */}

                <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
                    <input type="url" name="website" id="website" placeholder="https://..." value={formData.website} onChange={handleInputChange} className={inputStyle} />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Alamat</label>
                    <textarea name="address" id="address" rows={3} value={formData.address} onChange={handleInputChange} className={inputStyle} />
                </div>
            </div>

            <hr />

            <div className="space-y-2">
                <label className="text-lg font-semibold text-gray-800">Logo Perusahaan</label>
                <div className="mt-2 flex items-center gap-6">
                    <div className="flex-shrink-0">
                        {currentLogoUrl ? (
                             <Image src={currentLogoUrl} alt="Preview Logo" width={80} height={80} className="h-20 w-20 rounded-full object-cover ring-2 ring-gray-200" />
                        ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-3xl font-bold text-gray-400">?</div>
                        )}
                    </div>
                    <div className="flex-grow">
                        <label htmlFor="file-upload" className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                            <span>Ganti Logo</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => handleFileSelect(e.target.files)} />
                        </label>
                        <p className="mt-2 text-xs text-gray-500">PNG, JPG, WEBP hingga 2MB.</p>
                    </div>
                </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 mt-6">
                <div className="flex"><div className="flex-shrink-0"><AlertCircle className="h-5 w-5 text-red-400" /></div><div className="ml-3"><p className="text-sm font-medium text-red-800">{error}</p></div></div>
              </div>
            )}
            
            <div className="flex justify-end gap-4 pt-6 border-t">
                <button type="button" onClick={() => router.back()} className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                  Batal
                </button>
                <button onClick={handleSubmit} disabled={isSaving} className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400">
                    {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : 'Simpan Perubahan'}
                </button>
            </div>
        </div>
    );
}