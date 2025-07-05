// Lokasi file: src/app/(auth)/register/perusahaan/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import supabase from '../../../../lib/supabaseClient'; // Pastikan path ini benar
import { User, Briefcase, Mail, Lock, Building, Globe, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

// ... (Tipe data tidak berubah)
type JobCategory = {
    id: string;
    name: string;
};
type CompanyFormData = {
    picName: string;
    picPosition: string;
    email: string;
    password: string;
    companyName: string;
    industry: string;
    website: string;
};

// SOLUSI: Definisikan komponen helper DI LUAR komponen utama.
// Ini memastikan definisinya stabil dan tidak dibuat ulang setiap kali render.
const InputField = ({ icon: Icon, ...props }: any) => (
    <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon className="h-5 w-5 text-gray-400" />
        </span>
        <input {...props} className="w-full rounded-md border-gray-300 py-2 pl-10 pr-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
    </div>
);


export default function PerusahaanRegisterPage() {
    // Seluruh logika di dalam komponen ini (useState, useEffect, handler) tidak perlu diubah.
    const router = useRouter();

    const [formData, setFormData] = useState<CompanyFormData>({
        picName: '',
        picPosition: '',
        email: '',
        password: '',
        companyName: '',
        industry: '',
        website: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [categories, setCategories] = useState<JobCategory[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            setCategoriesLoading(true);
            const { data, error } = await supabase
                .from('job_categories')
                .select('id, name')
                .order('name', { ascending: true });

            if (error) {
                console.error('Error fetching categories:', error);
                setError('Gagal memuat daftar industri. Coba muat ulang halaman.');
            } else {
                setCategories(data || []);
            }
            setCategoriesLoading(false);
        };

        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!formData.industry) {
            setError('Silakan pilih industri perusahaan Anda.');
            return;
        }

        setLoading(true);

        const { data, error: signUpError } = await supabase.auth.signUp({
            email: formData.email.trim(),
            password: formData.password,
            options: {
                data: {
                    role: 'company_admin',
                    full_name: formData.picName.trim(),
                    position: formData.picPosition.trim(),
                    company_name: formData.companyName.trim(),
                    industry: formData.industry,
                    website: formData.website.trim(),
                }
            }
        });

        setLoading(false);

        if (signUpError) {
            setError(`Gagal mendaftar: ${signUpError.message}`);
            return;
        }
        
        if (data.user) {
             setSuccessMessage('Pendaftaran berhasil! Silakan periksa email Anda untuk verifikasi sebelum masuk.');
             setTimeout(() => {
                 router.push('/login');
             }, 4000);
        } else {
             setError('Terjadi kesalahan yang tidak diketahui saat pendaftaran.');
        }
    };
    
    // TIDAK ADA PERUBAHAN DI BAGIAN JSX/RETURN KARENA `InputField` SUDAH BENAR
    return (
        <div className="flex min-h-screen bg-white">
            {/* Panel Kiri - Dekoratif */}
            <div className="hidden w-1/2 items-center justify-center bg-indigo-700 p-12 lg:flex relative overflow-hidden">
                <div className="absolute bg-indigo-600 rounded-full w-96 h-96 -top-20 -left-20"></div>
                <div className="absolute bg-indigo-600 rounded-full w-64 h-64 -bottom-16 -right-10"></div>
                <div className="text-white text-center z-10">
                    <Link href="/">
                         <Image
                            src="/images/logo.png"
                            alt="Logo Talenta Vokasi"
                            width={200}
                            height={60}
                            className="mx-auto mb-8 rounded-full"
                            onError={(e) => { e.currentTarget.src = 'https://placehold.co/200x60/ffffff/1f2937?text=Talenta+Vokasi'; }}
                        />
                    </Link>
                    <h1 className="text-4xl font-bold tracking-tight">Temukan Talenta Vokasi Terbaik Bangsa</h1>
                    <p className="mt-4 text-lg max-w-md mx-auto text-indigo-200">Daftarkan perusahaan Anda dan dapatkan akses ke ribuan calon talenta yang siap berkontribusi.</p>
                </div>
            </div>

            {/* Panel Kanan - Form */}
            <div className="flex w-full items-center justify-center bg-gray-50 p-6 lg:w-1/2">
                <div className="w-full max-w-lg space-y-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Registrasi Akun Perusahaan
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Sudah punya akun?{' '}
                            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Masuk di sini
                            </Link>
                        </p>
                    </div>
                    
                    {successMessage && (
                        <div className="rounded-md bg-green-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">{successMessage}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {error && (
                         <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-red-800">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <fieldset className="space-y-4 rounded-lg border p-4">
                            <legend className="px-1 text-sm font-medium text-gray-700">Informasi Penanggung Jawab (PIC)</legend>
                            <InputField icon={User} name="picName" type="text" required placeholder="Nama Lengkap PIC" value={formData.picName} onChange={handleChange} />
                            <InputField icon={Briefcase} name="picPosition" type="text" required placeholder="Jabatan di Perusahaan" value={formData.picPosition} onChange={handleChange} />
                            <InputField icon={Mail} name="email" type="email" required placeholder="Email Kerja PIC" value={formData.email} onChange={handleChange} />
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </span>
                                <input name="password" type={showPassword ? 'text' : 'password'} required placeholder="Password Akun (min. 8 karakter)" minLength={8} value={formData.password} onChange={handleChange} className="w-full rounded-md border-gray-300 py-2 pl-10 pr-10 text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700">
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </fieldset>

                        <fieldset className="space-y-4 rounded-lg border p-4">
                            <legend className="px-1 text-sm font-medium text-gray-700">Informasi Perusahaan</legend>
                            <InputField icon={Building} name="companyName" type="text" required placeholder="Nama Resmi Perusahaan" value={formData.companyName} onChange={handleChange} />
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Briefcase className="h-5 w-5 text-gray-400" />
                                </span>
                                <select name="industry" required value={formData.industry} onChange={handleChange} disabled={categoriesLoading} className="w-full appearance-none rounded-md border-gray-300 py-2 pl-10 pr-10 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                    <option value="" disabled>{categoriesLoading ? 'Memuat industri...' : '-- Pilih Industri --'}</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <InputField icon={Globe} name="website" type="url" placeholder="https://websiteperusahaan.com (Opsional)" value={formData.website} onChange={handleChange} />
                        </fieldset>

                        <div>
                            <button type="submit" disabled={loading || !!successMessage} className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-400">
                                {loading ? 'Memproses...' : 'Daftarkan Akun'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}