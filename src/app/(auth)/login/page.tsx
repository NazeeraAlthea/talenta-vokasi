"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../../../lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import { AlertCircle } from 'lucide-react'; // Import ikon untuk pesan error

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    setLoading(false);

    if (error) {
      setError('Email atau password salah. Silakan coba lagi.');
      console.error('Login error:', error.message);
    } else if (data.user) {
      const role = data.user?.user_metadata?.role;
      router.refresh();

      if (role === 'student') {
        router.push('/siswa/dashboard');
      } else if (role === 'school_admin') {
        router.push('/sekolah/dashboard');
      } else if (role === 'company_admin') {
        router.push('/perusahaan/dashboard');
      } else {
        router.push('/');
      }
    }
  };

  // Mengadopsi gaya dari halaman registrasi
  const inputStyle = "w-full rounded-md border-gray-300 p-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500";
  const buttonStyle = "flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-400";


  return (
    <div className="flex min-h-screen bg-white">
      {/* Kolom Kiri untuk Branding (disamakan dengan halaman register) */}
      <div className="hidden w-1/2 items-center justify-center bg-indigo-700 p-12 lg:flex relative overflow-hidden">
        <div className="absolute bg-indigo-600 rounded-full w-96 h-96 -top-20 -left-20"></div>
        <div className="absolute bg-indigo-600 rounded-full w-64 h-64 -bottom-16 -right-10"></div>
        <div className="text-white text-center z-10">
          <Link href="/">
            <Image src="/images/logo.png" alt="Logo Talenta Vokasi" width={200} height={120} className="mx-auto mb-8 rounded-full" />
          </Link>
          <h1 className="text-4xl font-bold tracking-tight">Selamat Datang Kembali!</h1>
          <p className="mt-4 text-lg max-w-md mx-auto text-indigo-200">Hubungkan potensi Anda dengan peluang terbaik.</p>
        </div>
      </div>

      {/* Kolom Kanan untuk Form Login (disamakan dengan halaman register) */}
      <div className="flex w-full items-center justify-center bg-gray-50 p-6 lg:w-1/2 overflow-y-auto">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Masuk ke Akun Anda</h2>
            <p className="mt-2 text-sm text-gray-600">
              Belum punya akun?{' '}
              <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Daftar di sini
              </Link>
            </p>
          </div>

          {/* Pesan Error dengan gaya baru */}
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

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              name="email"
              type="email"
              required
              placeholder="Alamat Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputStyle}
            />
            <input
              name="password"
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputStyle}
            />

            <div>
              <button
                type="submit"
                disabled={loading}
                className={buttonStyle}
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}