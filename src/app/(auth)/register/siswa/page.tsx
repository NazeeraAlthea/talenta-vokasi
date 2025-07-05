"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../../../../lib/supabaseClient';

// Tipe data yang dibutuhkan
type School = {
  id: string;
  name: string;
};

type Major = {
  id: string;
  name: string;
};

type StudentFormData = {
  fullName: string;
  nisn: string;
  email: string;
  password: string;
};

export default function SiswaRegisterPage() {
  const router = useRouter();

  // State untuk form utama
  const [formData, setFormData] = useState<StudentFormData>({
    fullName: '',
    nisn: '',
    email: '',
    password: '',
  });

  // --- State untuk Autocomplete Sekolah & Jurusan ---
  const [schoolSearchTerm, setSchoolSearchTerm] = useState('');
  const [foundSchools, setFoundSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  
  const [majors, setMajors] = useState<Major[]>([]); // State untuk menampung daftar jurusan
  const [selectedMajorId, setSelectedMajorId] = useState<string>(''); // State untuk jurusan yg dipilih

  // State untuk UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- Logika untuk Autocomplete Sekolah ---
  const debounce = <F extends (...args: any[]) => any>(func: F, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): void => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const searchSchools = async (searchTerm: string) => {
    if (searchTerm.length < 3) {
      setFoundSchools([]);
      return;
    }
    const { data, error } = await supabase
      .from('schools')
      .select('id, name')
      .ilike('name', `%${searchTerm}%`)
      .limit(5);

    if (error) console.error('Error fetching schools:', error);
    else setFoundSchools(data || []);
  };
  
  const debouncedSearch = useCallback(debounce(searchSchools, 300), []);

  useEffect(() => {
    if (schoolSearchTerm && !selectedSchool) {
      debouncedSearch(schoolSearchTerm);
    } else {
      setFoundSchools([]);
    }
  }, [schoolSearchTerm, selectedSchool, debouncedSearch]);


  // --- PERUBAHAN DI SINI: Fetch Jurusan Saat Sekolah Dipilih ---
  const handleSchoolSelect = async (school: School) => {
    setSelectedSchool(school);
    setSchoolSearchTerm(school.name);
    setFoundSchools([]);
    
    // Reset state jurusan & mulai loading
    setMajors([]);
    setSelectedMajorId('');
    setLoading(true);

    const { data, error } = await supabase
      .from('majors')
      .select('id, name')
      .eq('school_id', school.id)
      .order('name');

    if (error) {
      setError("Gagal memuat daftar jurusan untuk sekolah ini.");
      console.error('Error fetching majors:', error);
    } else {
      setMajors(data || []);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Logika Handle Submit dengan Arsitektur Trigger ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!selectedSchool || schoolSearchTerm !== selectedSchool.name) {
      setError('Sekolah tidak valid. Harap pilih dari daftar.');
      return;
    }
    if (!selectedMajorId) {
      setError('Jurusan harus dipilih.');
      return;
    }

    setLoading(true);

    // Memanggil signUp standar, trigger di DB akan menangani pembuatan profil
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email.trim(),
      password: formData.password,
      options: {
        data: {
          role: 'student',
          full_name: formData.fullName.trim(),
          nisn: formData.nisn.trim(),
          school_id: selectedSchool.id,
          major_id: selectedMajorId,
        }
      }
    });

    setLoading(false);

    if (signUpError) {
      setError(`Gagal mendaftar: ${signUpError.message}`);
    } else {
      setSuccessMessage('Pendaftaran berhasil! Silakan periksa email Anda.');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 items-center justify-center bg-blue-600 p-12 lg:flex">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold">Selamat Datang, Talenta Muda!</h1>
          <p className="mt-4 text-lg">Langkah pertama Anda menuju karir impian dimulai di sini.</p>
        </div>
      </div>
      <div className="flex w-full items-center justify-center bg-gray-50 p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
            Registrasi Akun Siswa
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="fullName" type="text" required placeholder="Nama Lengkap" value={formData.fullName} onChange={handleChange} className="w-full rounded-md border-gray-300 p-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            <input name="nisn" type="text" required placeholder="NISN" value={formData.nisn} onChange={handleChange} className="w-full rounded-md border-gray-300 p-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            
            {/* Input Autocomplete Sekolah */}
            <div className="relative">
              <input 
                type="text" 
                required 
                placeholder="Ketik nama sekolah Anda..." 
                value={schoolSearchTerm}
                onChange={(e) => {
                  setSchoolSearchTerm(e.target.value);
                  setSelectedSchool(null);
                  setMajors([]); // Kosongkan jurusan jika sekolah diubah
                }}
                className="w-full rounded-md border-gray-300 p-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {foundSchools.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {foundSchools.map((school) => (
                    <li key={school.id}>
                      <button type="button" onClick={() => handleSchoolSelect(school)} className="w-full px-4 py-2 text-left text-gray-900 hover:bg-blue-50">
                        {school.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* --- PERUBAHAN DI SINI: Dropdown Jurusan Dinamis --- */}
            <select
              name="jurusan"
              required
              value={selectedMajorId}
              onChange={(e) => setSelectedMajorId(e.target.value)}
              disabled={!selectedSchool || loading} // Non-aktif jika sekolah belum dipilih
              className="w-full rounded-md border-gray-300 p-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="" disabled>
                {selectedSchool ? 'Pilih Jurusan Anda' : 'Pilih Sekolah Terlebih Dahulu'}
              </option>
              {majors.map((major) => (
                <option key={major.id} value={major.id}>
                  {major.name}
                </option>
              ))}
            </select>
            
            <input name="email" type="email" required placeholder="Email" value={formData.email} onChange={handleChange} className="w-full rounded-md border-gray-300 p-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            <input name="password" type="password" required placeholder="Password (min. 6 karakter)" value={formData.password} onChange={handleChange} className="w-full rounded-md border-gray-300 p-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            
            <div>
              <button type="submit" disabled={loading || !!successMessage} className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400">
                {loading ? 'Mendaftarkan...' : 'Daftar'}
              </button>
            </div>
            {error && <p className="text-center text-sm text-red-600">{error}</p>}
            {successMessage && <p className="text-center text-sm text-green-600">{successMessage}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
