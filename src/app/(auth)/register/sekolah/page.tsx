// Lokasi file: src/app/(auth)/register/sekolah/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import supabase from '../../../../lib/supabaseClient'; // Pastikan path ini benar
import { User, Briefcase, Mail, Lock, School, Hash, Award, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

// Tipe data untuk form
type SchoolFormData = {
    picName: string;
    picPosition: string;
    email: string;
    password: string;
    schoolName: string;
    npsn: string;
    accreditation: 'A' | 'B' | 'C' | 'PROSES' | 'BELUM' | '';
    level: 'SMK' | 'Perguruan Tinggi';
};

// Komponen helper untuk input field dengan ikon
// Didefinisikan di luar untuk mencegah masalah re-render dan kehilangan fokus
const InputField = ({ icon: Icon, ...props }: any) => (
    <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon className="h-5 w-5 text-gray-400" />
        </span>
        <input {...props} className="w-full rounded-md border-gray-300 py-2 pl-10 pr-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
    </div>
);

export default function SekolahRegisterPage() {
    const router = useRouter();

    const [formData, setFormData] = useState<SchoolFormData>({
        picName: '',
        picPosition: '',
        email: '',
        password: '',
        schoolName: '',
        npsn: '',
        accreditation: '', // Default kosong agar placeholder "-- Pilih Akreditasi --" terpilih
        level: 'SMK',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // Validasi khusus untuk NPSN agar hanya angka
        if (name === 'npsn') {
            const numericValue = value.replace(/[^0-9]/g, '');
            setFormData((prev) => ({ ...prev, [name]: numericValue }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!formData.accreditation) {
            setError('Silakan pilih status akreditasi sekolah Anda.');
            return;
        }

        setLoading(true);

        const { data, error: signUpError } = await supabase.auth.signUp({
            email: formData.email.trim(),
            password: formData.password,
            options: {
                data: {
                    role: 'school_admin',
                    full_name: formData.picName.trim(),
                    position: formData.picPosition.trim(),
                    school_name: formData.schoolName.trim(),
                    npsn: formData.npsn.trim(),
                    accreditation: formData.accreditation,
                    level: formData.level,
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

    return (
        <div className="flex min-h-screen bg-white">
            {/* Panel Kiri - Dekoratif */}
            <div className="hidden w-1/2 items-center justify-center bg-indigo-700 p-12 lg:flex relative overflow-hidden">
                 <div className="absolute bg-indigo-600 rounded-full w-96 h-96 -top-20 -left-20"></div>
                <div className="absolute bg-indigo-600 rounded-full w-64 h-64 -bottom-16 -right-10"></div>
                <div className="text-white text-center z-10">
                    <Link href="/">
                         <Image
                            src="/images/logo.png" // Anda perlu logo versi putih
                            alt="Logo Talenta Vokasi"
                            width={200}
                            height={60}
                            className="mx-auto mb-8 rounded-full"
                            onError={(e) => { e.currentTarget.src = 'https://placehold.co/200x60/ffffff/1f2937?text=Talenta+Vokasi'; }}
                        />
                    </Link>
                    <h1 className="text-4xl font-bold tracking-tight">Buka Peluang Emas untuk Siswa Anda</h1>
                    <p className="mt-4 text-lg max-w-md mx-auto text-indigo-200">Daftarkan sekolah Anda dan hubungkan siswa-siswi terbaik dengan industri terdepan.</p>
                </div>
            </div>

            {/* Panel Kanan - Form */}
            <div className="flex w-full items-center justify-center bg-gray-50 p-6 lg:w-1/2">
                <div className="w-full max-w-lg space-y-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Registrasi Akun Sekolah
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
                                <div className="flex-shrink-0"><CheckCircle className="h-5 w-5 text-green-400" /></div>
                                <div className="ml-3"><p className="text-sm font-medium text-green-800">{successMessage}</p></div>
                            </div>
                        </div>
                    )}
                    
                    {error && (
                         <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0"><AlertCircle className="h-5 w-5 text-red-400" /></div>
                                <div className="ml-3"><p className="text-sm font-medium text-red-800">{error}</p></div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <fieldset className="space-y-4 rounded-lg border p-4">
                            <legend className="px-1 text-sm font-medium text-gray-700">Informasi Penanggung Jawab (PIC)</legend>
                            <InputField icon={User} name="picName" type="text" required placeholder="Nama Lengkap PIC" value={formData.picName} onChange={handleChange} />
                            <InputField icon={Briefcase} name="picPosition" type="text" required placeholder="Jabatan (cth: Kepala Sekolah, Humas)" value={formData.picPosition} onChange={handleChange} />
                            <InputField icon={Mail} name="email" type="email" required placeholder="Email Kerja PIC" value={formData.email} onChange={handleChange} />
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><Lock className="h-5 w-5 text-gray-400" /></span>
                                <input name="password" type={showPassword ? 'text' : 'password'} required placeholder="Password Akun (min. 8 karakter)" minLength={8} value={formData.password} onChange={handleChange} className="w-full rounded-md border-gray-300 py-2 pl-10 pr-10 text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700">
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </fieldset>

                        <fieldset className="space-y-4 rounded-lg border p-4">
                            <legend className="px-1 text-sm font-medium text-gray-700">Informasi Sekolah</legend>
                            <InputField icon={School} name="schoolName" type="text" required placeholder="Nama Resmi Sekolah" value={formData.schoolName} onChange={handleChange} />
                            <InputField icon={Hash} name="npsn" type="text" required placeholder="NPSN (8 digit)" value={formData.npsn} onChange={handleChange} maxLength={8} />
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Award className="h-5 w-5 text-gray-400" /></span>
                                <select name="accreditation" required value={formData.accreditation} onChange={handleChange} className="w-full appearance-none rounded-md border-gray-300 py-2 pl-10 pr-10 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                    <option value="" disabled>-- Pilih Akreditasi --</option>
                                    <option value="A">Akreditasi A</option>
                                    <option value="B">Akreditasi B</option>
                                    <option value="C">Akreditasi C</option>
                                    <option value="PROSES">Proses Akreditasi</option>
                                    <option value="BELUM">Belum Terakreditasi</option>
                                </select>
                            </div>
                        </fieldset>

                        <div>
                            <button type="submit" disabled={loading || !!successMessage} className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-400">
                                {loading ? 'Memproses...' : 'Daftarkan Akun Sekolah'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
