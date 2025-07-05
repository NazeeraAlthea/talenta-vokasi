"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../../../lib/supabaseClient';
import Link from 'next/link';

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

    // DIUBAH: Tangkap 'data' untuk mendapatkan informasi user setelah login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    setLoading(false);

    if (error) {
      setError('Email atau password salah. Silakan coba lagi.');
      console.error('Login error:', error.message);
    } else if (data.user) {
      // ✨ DIUBAH: Logika redirect berdasarkan role pengguna ✨

      // Ambil role dari metadata pengguna
      const role = data.user?.user_metadata?.role;

      // Lakukan refresh untuk memastikan server components mendapat data sesi terbaru
      router.refresh();

      // Arahkan ke dashboard yang sesuai
      if (role === 'student') {
        router.push('/siswa/dashboard');
      } else if (role === 'school_admin') {
        router.push('/sekolah/dashboard');
      } else if (role === 'company_admin') {
        router.push('/perusahaan/dashboard');
      } else {
        // Fallback jika role tidak terdefinisi, arahkan ke halaman utama
        router.push('/');
      }
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Kolom Kiri untuk Branding */}
      <div className="hidden w-1/2 items-center justify-center bg-blue-600 p-12 lg:flex">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold">Talenta Vokasi</h1>
          <p className="mt-4 text-lg">Hubungkan Potensi Anda dengan Peluang Terbaik.</p>
        </div>
      </div>

      {/* Kolom Kanan untuk Form Login */}
      <div className="flex w-full items-center justify-center bg-gray-50 p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
            Selamat Datang Kembali
          </h2>
          <form onSubmit={handleLogin} className="space-y-5">
            <input
              name="email"
              type="email"
              required
              placeholder="Alamat Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border-gray-300 p-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              name="password"
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border-gray-300 p-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </div>

            {error && <p className="text-center text-sm text-red-600">{error}</p>}
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Belum punya akun?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}