// Lokasi file: src/app/(auth)/register/perusahaan/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../../../../lib/supabaseClient'; // Pastikan path ini benar

// Tipe data untuk form registrasi perusahaan
type CompanyFormData = {
    picName: string;
    picPosition: string;
    email: string;
    password: string;
    companyName: string;
    industry: string;
    website: string; // Opsional
};

export default function PerusahaanRegisterPage() {
    const router = useRouter();

    const [formData, setFormData] = useState<CompanyFormData>({
        picName: '',
        picPosition: '',
        email: '',
        password: '',
        companyName: '',
        industry: '', // Default kosong, user harus memilih
        website: '',
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

        if (!formData.industry) {
            setError('Silakan pilih industri perusahaan Anda.');
            return;
        }

        setLoading(true);

        const { data, error } = await supabase.auth.signUp({
            email: formData.email.trim(),
            password: formData.password,
            options: {
                // Data ini akan dibaca oleh trigger di backend untuk membuat entri di tabel 'companies'
                data: {
                    role: 'company_admin', // Role untuk perusahaan
                    full_name: formData.picName.trim(),
                    position: formData.picPosition.trim(),
                    company_name: formData.companyName.trim(),
                    industry: formData.industry,
                    website: formData.website.trim(),
                }
            }
        });

        setLoading(false);

        if (error) {
            setError(`Gagal mendaftar: ${error.message}`);
            return; // Hentikan eksekusi jika ada error
        }
        
        // Jika tidak ada error, tampilkan pesan sukses
        setSuccessMessage('Pendaftaran perusahaan berhasil! Silakan periksa email Anda untuk verifikasi.');

        // Redirect ke halaman login setelah beberapa detik
        setTimeout(() => {
            router.push('/login');
        }, 3000);
    };

    return (
        <div className="flex min-h-screen">
            {/* Panel Kiri */}
            <div className="hidden w-1/2 items-center justify-center bg-indigo-600 p-12 lg:flex">
                <div className="text-white text-center">
                    <h1 className="text-4xl font-bold">Temukan Talenta Terbaik</h1>
                    <p className="mt-4 text-lg">Daftarkan perusahaan Anda dan dapatkan akses ke ribuan calon talenta vokasi yang siap berkontribusi.</p>
                </div>
            </div>

            {/* Panel Kanan - Form */}
            <div className="flex w-full items-center justify-center bg-gray-50 p-6 lg:w-1/2">
                <div className="w-full max-w-lg">
                    <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
                        Registrasi Akun Perusahaan
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Fieldset untuk Informasi PIC */}
                        <fieldset className="space-y-4 rounded-lg border p-4">
                            <legend className="-ml-1 px-1 text-sm font-medium text-gray-700">Informasi Penanggung Jawab (PIC)</legend>
                            <input name="picName" type="text" required placeholder="Nama Lengkap PIC" value={formData.picName} onChange={handleChange} className="w-full rounded-md border-gray-300 p-2 text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                            <input name="picPosition" type="text" required placeholder="Jabatan di Perusahaan" value={formData.picPosition} onChange={handleChange} className="w-full rounded-md border-gray-300 p-2 text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                            <input name="email" type="email" required placeholder="Email Kerja PIC" value={formData.email} onChange={handleChange} className="w-full rounded-md border-gray-300 p-2 text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                            <input name="password" type="password" required placeholder="Password Akun" minLength={8} value={formData.password} onChange={handleChange} className="w-full rounded-md border-gray-300 p-2 text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        </fieldset>

                        {/* Fieldset untuk Informasi Perusahaan */}
                        <fieldset className="space-y-4 rounded-lg border p-4">
                            <legend className="-ml-1 px-1 text-sm font-medium text-gray-700">Informasi Perusahaan</legend>
                            <input name="companyName" type="text" required placeholder="Nama Resmi Perusahaan / PT" value={formData.companyName} onChange={handleChange} className="w-full rounded-md border-gray-300 p-2 text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                            <select name="industry" required value={formData.industry} onChange={handleChange} className="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                <option value="" disabled>-- Pilih Industri --</option>
                                <option value="Teknologi Informasi">Teknologi Informasi</option>
                                <option value="Keuangan & Perbankan">Keuangan & Perbankan</option>
                                <option value="Manufaktur">Manufaktur</option>
                                <option value="Kreatif & Desain">Kreatif & Desain</option>
                                <option value="Pendidikan">Pendidikan</option>
                                <option value="Kesehatan">Kesehatan</option>
                                <option value="Retail & Perdagangan">Retail & Perdagangan</option>
                                <option value="Perhotelan & Pariwisata">Perhotelan & Pariwisata</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                            <input name="website" type="url" placeholder="Situs Web Perusahaan (Opsional)" value={formData.website} onChange={handleChange} className="w-full rounded-md border-gray-300 p-2 text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        </fieldset>

                        {/* Tombol Submit dan Pesan Status */}
                        <div>
                            <button type="submit" disabled={loading || !!successMessage} className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400">
                                {loading ? 'Memproses...' : 'Daftarkan Perusahaan'}
                            </button>
                        </div>
                        {error && <p className="text-center text-sm text-red-600">{error}</p>}
                        {successMessage && <p className="text-center text-sm text-green-600">{successMessage}</p>}
                        
                        {/* Link ke Halaman Login */}
                        <p className="mt-6 text-center text-sm text-gray-600">
                            Sudah punya akun?{' '}
                            <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Masuk di sini
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}