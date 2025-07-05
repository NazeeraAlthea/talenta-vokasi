// Lokasi file: src/app/(auth)/register/sekolah/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../../../../lib/supabaseClient';

// Tipe data untuk form
type SchoolFormData = {
    picName: string;
    picPosition: string;
    email: string;
    password: string;
    schoolName: string;
    npsn: string;
    accreditation: 'A' | 'B' | 'C' | 'PROSES' | 'BELUM';
    level: 'SMK';
};

export default function SekolahRegisterPage() {
    const router = useRouter();

    const [formData, setFormData] = useState<SchoolFormData>({
        picName: '',
        picPosition: '',
        email: '',
        password: '',
        schoolName: '',
        npsn: '',
        accreditation: 'A',
        level: 'SMK',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
            // Data ini akan dibaca oleh trigger di backend
            data: {
                role: 'school_admin',
                full_name: formData.picName.trim(), // 'full_name' untuk konsistensi
                position: formData.picPosition.trim(),
                school_name: formData.schoolName.trim(),
                npsn: formData.npsn.trim(),
                accreditation: formData.accreditation,
                level: formData.level,
            }
        }
    });

    setLoading(false);

    if (error) {
        setError(`Gagal mendaftar: ${error.message}`);
    }

        setSuccessMessage('Pendaftaran sekolah berhasil! Silakan periksa email Anda untuk verifikasi.');

        setTimeout(() => {
            router.push('/login');
        }, 3000);
    };

    return (
        <div className="flex min-h-screen">
            <div className="hidden w-1/2 items-center justify-center bg-blue-600 p-12 lg:flex">
                <div className="text-white text-center">
                    <h1 className="text-4xl font-bold">Daftarkan Sekolah Anda</h1>
                    <p className="mt-4 text-lg">Buka pintu peluang bagi siswa-siswi terbaik Anda.</p>
                </div>
            </div>
            <div className="flex w-full items-center justify-center bg-gray-50 p-6 lg:w-1/2">
                <div className="w-full max-w-lg">
                    <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
                        Registrasi Akun Sekolah
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <fieldset className="space-y-4 rounded-lg border p-4">
                            <legend className="-ml-1 px-1 text-sm font-medium text-gray-700">Informasi Penanggung Jawab (PIC)</legend>
                            <input name="picName" type="text" required placeholder="Nama Lengkap PIC" value={formData.picName} onChange={handleChange} className="w-full rounded-md border-gray-300 p-2 text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                            <input name="picPosition" type="text" required placeholder="Jabatan di Sekolah" value={formData.picPosition} onChange={handleChange} className="w-full rounded-md border-gray-300 p-2 text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                            <input name="email" type="email" required placeholder="Email Kerja PIC" value={formData.email} onChange={handleChange} className="w-full rounded-md border-gray-300 p-2 text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                            <input name="password" type="password" required placeholder="Password Akun" value={formData.password} onChange={handleChange} className="w-full rounded-md border-gray-300 p-2 text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        </fieldset>
                        <fieldset className="space-y-4 rounded-lg border p-4">
                            <legend className="-ml-1 px-1 text-sm font-medium text-gray-700">Informasi Resmi Sekolah</legend>
                            {/* --- KODE DIKEMBALIKAN KE BENTUK SEMULA --- */}
                            <input name="schoolName" type="text" required placeholder="Nama Resmi Sekolah" value={formData.schoolName} onChange={handleChange} className="w-full rounded-md border-gray-300 p-2 text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                            <input
                                name="npsn"
                                type="text"
                                required
                                placeholder="NPSN (8 digit)"
                                value={formData.npsn}
                                onChange={handleChange}
                                maxLength={8}
                                className="w-full rounded-md border-gray-300 p-2 text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <div>
                                <select name="accreditation" required value={formData.accreditation} onChange={handleChange} className="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                    <option value="A">Akreditasi A</option>
                                    <option value="B">Akreditasi B</option>
                                    <option value="C">Akreditasi C</option>
                                    <option value="PROSES">Proses Akreditasi</option>
                                    <option value="BELUM">Belum Terakreditasi</option>
                                </select>
                            </div>
                        </fieldset>
                        <div>
                            <button type="submit" disabled={loading || !!successMessage} className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400">
                                {loading ? 'Memproses...' : 'Daftarkan Sekolah'}
                            </button>
                        </div>
                        {error && <p className="text-center text-sm text-red-600">{error}</p>}
                        {successMessage && <p className="text-center text-sm text-green-600">{successMessage}</p>}
                        <p className="mt-6 text-center text-sm text-gray-600">
                            Sudah punya akun?{' '}
                            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                Masuk di sini
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
