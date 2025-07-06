"use client";

import { useState, DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient'; 
import { Loader2, UploadCloud, FileImage, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

type School = { id: string; user_id: string; name: string; npsn: string; address: string | null; accreditation: string; level: string; logo_url: string | null; };
type FormProps = { school: School; };

export default function EditSekolahForm({ school }: FormProps) {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: school.name,
        npsn: school.npsn,
        address: school.address || '',
        accreditation: school.accreditation,
        level: school.level,
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileSelect = (files: FileList | null) => {
        if (files && files[0]) {
            if (!files[0].type.startsWith("image/")) { setError("Hanya file gambar yang diizinkan."); return; }
            if (files[0].size > 2 * 1024 * 1024) { setError("Ukuran file maksimal adalah 2MB."); return; }
            setError(null);
            setLogoFile(files[0]);
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
        let logoUrl = school.logo_url;

        try {
            if (logoFile) {
                const filePath = `${school.user_id}/${Date.now()}_${logoFile.name}`;
                const { error: uploadError } = await supabase.storage.from('logos').upload(filePath, logoFile, { upsert: true });
                if (uploadError) throw new Error(`Gagal mengunggah logo: ${uploadError.message}`);
                
                const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(filePath);
                logoUrl = publicUrl;
            }

            // Kirim data yang bisa diubah saja. NPSN dan Nama tidak perlu dikirim.
            const response = await fetch('/api/profile/update-sekolah', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address: formData.address,
                    accreditation: formData.accreditation,
                    logo_url: logoUrl
                }),
            });

            if (!response.ok) { const result = await response.json(); throw new Error(result.error); }

            toast.success('Profil sekolah berhasil diperbarui!');
            
            router.push('/sekolah/profil');
            router.refresh();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const inputStyle = "mt-1 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600";
    const disabledInputStyle = "mt-1 block w-full rounded-md border-gray-300 bg-gray-100 px-3 py-2 text-gray-500 shadow-sm cursor-not-allowed";

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* --- PERUBAHAN DI SINI --- */}
                <div className="md:col-span-1">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Sekolah</label>
                    <input type="text" name="name" id="name" value={formData.name} className={disabledInputStyle} disabled />
                </div>
                <div className="md:col-span-1">
                    <label htmlFor="npsn" className="block text-sm font-medium text-gray-700">NPSN</label>
                    <input type="text" name="npsn" id="npsn" value={formData.npsn} className={disabledInputStyle} disabled />
                </div>
                {/* ------------------------- */}

                <div className="md:col-span-2"><label htmlFor="address" className="block text-sm font-medium text-gray-700">Alamat Sekolah</label><textarea name="address" id="address" rows={3} value={formData.address} onChange={handleInputChange} className={inputStyle} /></div>
                <div className="md:col-span-1"><label htmlFor="accreditation" className="block text-sm font-medium text-gray-700">Akreditasi</label><select name="accreditation" id="accreditation" value={formData.accreditation} onChange={handleInputChange} className={inputStyle}><option>A</option><option>B</option><option>C</option><option>PROSES</option><option>BELUM</option></select></div>
                <div className="md:col-span-1"><label htmlFor="level" className="block text-sm font-medium text-gray-700">Jenjang</label><input name="level" id="level" value={formData.level} className={disabledInputStyle} disabled></input></div>
            </div>

            <hr />

            <div className="space-y-2">
                <label className="text-lg font-semibold text-gray-800">Logo Sekolah</label>
                <div className="mt-2">
                    {!logoFile ? (
                        <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50'}`}>
                            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600"><span className="font-semibold text-indigo-600">Tarik & lepas file</span> atau <label htmlFor="file-upload" className="cursor-pointer font-semibold text-indigo-600 hover:underline">Pilih File</label></p>
                            <input id="file-upload" type="file" className="sr-only" accept="image/*" onChange={e => handleFileSelect(e.target.files)} />
                            <p className="text-xs text-gray-500 mt-2">PNG, JPG, WEBP hingga 2MB.</p>
                        </div>
                    ) : (
                        <div className="rounded-lg border bg-slate-50 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3"><FileImage className="h-8 w-8 text-indigo-500" /><div><p className="text-sm font-medium text-gray-800 truncate max-w-xs">{logoFile.name}</p></div></div>
                            <button onClick={() => setLogoFile(null)} className="text-sm font-medium text-red-600 hover:text-red-800">Ganti File</button>
                        </div>
                    )}
                </div>
            </div>

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
            
            <div className="flex justify-end gap-4 pt-6 border-t">
                <button type="button" onClick={() => router.push('/sekolah/profil')} className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                  Batal
                </button>
                <button onClick={handleSubmit} disabled={isSaving} className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400">
                    {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : 'Simpan Perubahan'}
                </button>
            </div>
        </div>
    );
}