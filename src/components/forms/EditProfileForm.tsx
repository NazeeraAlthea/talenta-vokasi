"use client";

import { useState, DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient'; 
import { FileText, UploadCloud, Loader2 } from 'lucide-react';

// Tipe data untuk props
type Student = { id: string; user_id: string; full_name: string; nisn: string; portfolio_url: string | null; school_id: string; major_id: string; cv_url: string | null; };
type School = { id: string; name: string; };
type Major = { id: string; name: string; };

type FormProps = {
  student: Student;
  schools: School[];
  majors: Major[];
};

export default function EditProfileForm({ student, schools, majors }: FormProps) {
  const router = useRouter();

  // State untuk data form
  const [formData, setFormData] = useState({
    full_name: student.full_name,
    portfolio_url: student.portfolio_url || '',
    school_id: student.school_id,
    major_id: student.major_id,
  });

  // State untuk upload CV
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  // Handler untuk input teks dan select
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // Handler untuk saat file dipilih
  const handleFileSelect = (files: FileList | null) => {
    if (files && files[0]) {
      if (files[0].type !== "application/pdf") { 
        setError("Hanya file PDF yang diizinkan."); 
        return; 
      }
      if (files[0].size > 5 * 1024 * 1024) { // Batas 5MB
        setError("Ukuran file maksimal adalah 5MB."); 
        return; 
      }
      setError(null);
      setSelectedFile(files[0]);
    }
  };

  // Handler untuk event drag-and-drop
  const handleDrag = (e: DragEvent<HTMLDivElement>) => { 
    e.preventDefault(); 
    e.stopPropagation(); 
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => { 
    e.preventDefault(); 
    e.stopPropagation(); 
    setIsDragActive(false); 
    handleFileSelect(e.dataTransfer.files); 
  };
  
  // Handler utama saat tombol "Simpan Perubahan" diklik
  const handleSubmit = async () => {
    setIsSaving(true);
    setError(null);
    let cvUrl = student.cv_url;

    try {
      // Langkah 1: Jika ada file CV baru, unggah terlebih dahulu
      if (selectedFile) {
        const filePath = `${student.user_id}/${selectedFile.name}`;
        const { error: uploadError } = await supabase.storage.from('cvs').upload(filePath, selectedFile, { upsert: true });

        if (uploadError) throw new Error(`Gagal mengunggah CV: ${uploadError.message}`);
        
        const { data: { publicUrl } } = supabase.storage.from('cvs').getPublicUrl(filePath);
        cvUrl = publicUrl;
      }

      // Langkah 2: Update data profil di tabel 'students'
      const { error: updateError } = await supabase
        .from('students')
        .update({ 
          full_name: formData.full_name,
          portfolio_url: formData.portfolio_url,
          cv_url: cvUrl 
        })
        .eq('id', student.id);

      if (updateError) throw updateError;

      alert('Profil berhasil diperbarui!');
      router.push('/siswa/profil');
      router.refresh();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Variabel untuk styling konsisten
  const inputClasses = "mt-1 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6";
  const disabledInputClasses = "mt-1 block w-full rounded-md border-gray-300 bg-gray-100 px-3 py-2 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-200 cursor-not-allowed";

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium leading-6 text-gray-900">Nama Lengkap</label>
          <input type="text" name="full_name" id="full_name" value={formData.full_name} onChange={handleInputChange} className={inputClasses} />
        </div>
        <div>
          <label htmlFor="school_id" className="block text-sm font-medium leading-6 text-gray-900">Asal Sekolah</label>
          <select name="school_id" id="school_id" value={formData.school_id} className={disabledInputClasses} disabled>
            {schools.map(school => <option key={school.id} value={school.id}>{school.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="major_id" className="block text-sm font-medium leading-6 text-gray-900">Jurusan</label>
          <select name="major_id" id="major_id" value={formData.major_id} className={disabledInputClasses} disabled>
            {majors.map(major => <option key={major.id} value={major.id}>{major.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="portfolio_url" className="block text-sm font-medium leading-6 text-gray-900">Link Portofolio</label>
          <input type="url" name="portfolio_url" id="portfolio_url" placeholder="https://..." value={formData.portfolio_url} onChange={handleInputChange} className={inputClasses} />
        </div>
      </div>
      
      <hr/>

      <div className="space-y-2">
        <label className="text-lg font-semibold text-gray-800">Unggah atau Ganti CV</label>
        <div className="mt-2">
          {isSaving ? (
              <div className="text-center space-y-4 py-10">
                  <Loader2 className="mx-auto h-12 w-12 text-indigo-600 animate-spin" />
                  <div className="text-lg font-semibold text-gray-700">Menyimpan Perubahan...</div>
              </div>
          ) : !selectedFile ? (
              <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50'}`}>
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600"><span className="font-semibold text-indigo-600">Tarik & lepas file Anda di sini</span></p>
                  <p className="text-xs text-gray-500 mt-1">atau</p>
                  <label htmlFor="file-upload" className="cursor-pointer mt-2 text-sm font-medium text-indigo-600 hover:underline">Pilih File</label>
                  <input id="file-upload" type="file" className="sr-only" accept=".pdf" onChange={e => handleFileSelect(e.target.files)} />
                  <p className="text-xs text-gray-500 mt-2">Hanya format PDF, maks 5MB.</p>
              </div>
          ) : (
              <div className="rounded-lg border bg-slate-50 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-indigo-500" />
                      <div>
                          <p className="text-sm font-medium text-gray-800 truncate max-w-xs">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="text-sm font-medium text-red-600 hover:text-red-800">Ganti File</button>
              </div>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      
      <div className="flex justify-end gap-4 pt-6 border-t">
        <button type="button" onClick={() => router.push('/siswa/profil')} className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          Batal
        </button>
        <button onClick={handleSubmit} disabled={isSaving} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
          {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  );
}