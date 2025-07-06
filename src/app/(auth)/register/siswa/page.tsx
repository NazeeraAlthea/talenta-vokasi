"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../../../../lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, AlertCircle } from 'lucide-react';

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
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // State untuk form utama
  const [formData, setFormData] = useState<StudentFormData>({
    fullName: '',
    nisn: '',
    email: '',
    password: '',
  });

  // State untuk Autocomplete Sekolah & Jurusan
  const [schoolSearchTerm, setSchoolSearchTerm] = useState('');
  const [foundSchools, setFoundSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // State untuk Jurusan
  const [majors, setMajors] = useState<Major[]>([]);
  const [selectedMajorId, setSelectedMajorId] = useState<string>('');

  // State untuk UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Logika untuk Autocomplete Sekolah
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
    setIsSearching(true);
    const { data, error } = await supabase
      .from('schools')
      .select('id, name')
      .ilike('name', `%${searchTerm}%`)
      .limit(5);

    if (error) console.error('Error fetching schools:', error);
    else setFoundSchools(data || []);
    setIsSearching(false);
  };

  const debouncedSearch = useCallback(debounce(searchSchools, 400), []);

  useEffect(() => {
    if (schoolSearchTerm && !selectedSchool) {
      debouncedSearch(schoolSearchTerm);
    } else {
      setFoundSchools([]);
    }
  }, [schoolSearchTerm, selectedSchool, debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setFoundSchools([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSchoolSelect = async (school: School) => {
    setSelectedSchool(school);
    setSchoolSearchTerm(school.name);
    setFoundSchools([]);
    setMajors([]);
    setSelectedMajorId('');
    setLoading(true);

    const { data, error } = await supabase.from('majors').select('id, name').eq('school_id', school.id).order('name');
    
    if (error) {
      setError("Gagal memuat daftar jurusan untuk sekolah ini.");
      console.error('Error fetching majors:', error);
    } else {
      setMajors(data || []);
    }
    setLoading(false);
  };
  
  const handleSchoolInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSchoolSearchTerm(e.target.value);
    if (selectedSchool) {
      setSelectedSchool(null);
      setMajors([]);
      setSelectedMajorId('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // PERBAIKAN DI SINI: Variabel 'name' diganti menjadi 'fieldName'
    const { name: fieldName, value } = e.target;
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

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

  const inputStyle = "w-full rounded-md border-gray-300 p-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500";
  const selectStyle = "w-full rounded-md border-gray-300 p-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100";

  return (
    <div className="flex min-h-screen bg-white">
      <div className="hidden w-1/2 items-center justify-center bg-indigo-700 p-12 lg:flex relative overflow-hidden">
        <div className="absolute bg-indigo-600 rounded-full w-96 h-96 -top-20 -left-20"></div>
        <div className="absolute bg-indigo-600 rounded-full w-64 h-64 -bottom-16 -right-10"></div>
        <div className="text-white text-center z-10">
          <Link href="/">
            <Image src="/images/logo.png" alt="Logo Talenta Vokasi" width={200} height={120} className="mx-auto mb-8 rounded-full" />
          </Link>
          <h1 className="text-4xl font-bold tracking-tight">Selamat Datang, Talenta Muda!</h1>
          <p className="mt-4 text-lg max-w-md mx-auto text-indigo-200">Langkah pertama Anda menuju karir impian dimulai di sini.</p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-gray-50 p-6 lg:w-1/2 overflow-y-auto">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Registrasi Akun Siswa</h2>
            <p className="mt-2 text-sm text-gray-600">Sudah punya akun? <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Masuk di sini</Link></p>
          </div>

          {successMessage && <div className="rounded-md bg-green-50 p-4"><div className="flex"><div className="flex-shrink-0"><CheckCircle className="h-5 w-5 text-green-400" /></div><div className="ml-3"><p className="text-sm font-medium text-green-800">{successMessage}</p></div></div></div>}
          {error && <div className="rounded-md bg-red-50 p-4"><div className="flex"><div className="flex-shrink-0"><AlertCircle className="h-5 w-5 text-red-400" /></div><div className="ml-3"><p className="text-sm font-medium text-red-800">{error}</p></div></div></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="fullName" type="text" required placeholder="Nama Lengkap" value={formData.fullName} onChange={handleChange} className={inputStyle} />
            <input name="nisn" type="text" required placeholder="NISN" value={formData.nisn} onChange={handleChange} className={inputStyle} />

            <div className="relative" ref={searchContainerRef}>
              <input
                type="text"
                required
                placeholder="Ketik nama sekolah Anda..."
                value={schoolSearchTerm}
                onChange={handleSchoolInputChange}
                className={inputStyle}
              />
              {schoolSearchTerm.length >= 3 && !selectedSchool && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {isSearching ? (
                    <li className="px-4 py-2 text-gray-500">Mencari...</li>
                  ) : foundSchools.length > 0 ? (
                    foundSchools.map((school) => (
                      <li key={school.id}>
                        <button type="button" onClick={() => handleSchoolSelect(school)} className="w-full px-4 py-2 text-left text-gray-900 hover:bg-indigo-50">
                          {school.name}
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-gray-500">Sekolah tidak ditemukan.</li>
                  )}
                </ul>
              )}
            </div>

            <select
              name="major_id" // <-- Pastikan name sesuai dengan state yang ingin diupdate
              required
              value={selectedMajorId}
              onChange={(e) => setSelectedMajorId(e.target.value)}
              disabled={!selectedSchool || loading}
              className={selectStyle}
            >
              <option value="" disabled>{loading ? 'Memuat...' : (selectedSchool ? 'Pilih Jurusan Anda' : 'Pilih Sekolah Terlebih Dahulu')}</option>
              {majors.map((major) => (<option key={major.id} value={major.id}>{major.name}</option>))}
            </select>

            <input name="email" type="email" required placeholder="Email" value={formData.email} onChange={handleChange} className={inputStyle} />
            <input name="password" type="password" required placeholder="Password (min. 6 karakter)" value={formData.password} onChange={handleChange} className={inputStyle} />

            <div>
              <button type="submit" disabled={loading || !!successMessage} className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-400">
                {loading ? 'Mendaftarkan...' : 'Daftar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}