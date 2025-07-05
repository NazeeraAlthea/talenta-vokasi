"use client";

import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Pastikan ini ada

// Tipe data untuk statistik
type DashboardStats = {
  totalMajors: number;
  totalQuota: number;
  totalStudents: number;
  verifiedStudents: number;
};

type School = {
  id: string;
  name: string;
};

// Komponen untuk kartu navigasi
const ActionCard = ({ href, title, description, icon }: { href: string; title: string; description: string; icon: string; }) => (
  <Link href={href} className="block rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
    <div className="flex items-center">
      <div className="text-3xl">{icon}</div>
      <div className="ml-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </Link>
);

// Komponen untuk kartu statistik
const StatCard = ({ value, label }: { value: number | string; label: string; }) => (
  <div className="rounded-lg border bg-white px-4 py-5 shadow-sm sm:p-6">
    <dt className="truncate text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{value}</dd>
  </div>
);

export default function SekolahDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalMajors: 0,
    totalQuota: 0,
    totalStudents: 0,
    verifiedStudents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Gagal memuat sesi pengguna.");
      setLoading(false);
      return;
    }
    setUser(user);

    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .select('id, name')
      .eq('user_id', user.id)
      .single();

    if (schoolError || !schoolData) {
      setError("Gagal memuat profil sekolah.");
      setLoading(false);
      return;
    }
    setSchool(schoolData);

    // Ambil data jurusan untuk statistik
    const { data: majorsData, error: majorsError } = await supabase
      .from('majors')
      .select('quota')
      .eq('school_id', schoolData.id);

    // Ambil data siswa untuk statistik
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select('verification_status')
      .eq('school_id', schoolData.id);

    if (majorsError || studentsError) {
      setError("Gagal memuat data statistik.");
      setLoading(false);
      return;
    }

    // Hitung statistik
    const totalQuota = majorsData?.reduce((sum, major) => sum + major.quota, 0) || 0;
    const verifiedStudents = studentsData?.filter(s => s.verification_status === 'VERIFIED_BY_SCHOOL').length || 0;

    setStats({
      totalMajors: majorsData?.length || 0,
      totalQuota: totalQuota,
      totalStudents: studentsData?.length || 0,
      verifiedStudents: verifiedStudents,
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Memuat dashboard...</div>;
  }

  if (error) {
    return <div className="flex h-screen items-center justify-center text-red-600">{error}</div>;
  }

  const handleLogout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError("Gagal untuk logout. Silakan coba lagi.");
      console.error("Logout error:", error.message);
      setLoading(false);
    } else {
      // Arahkan ke halaman login setelah berhasil logout
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Sekolah</h1>
            <p className="mt-1 text-lg text-gray-600">
              Selamat datang kembali, <strong>{school?.name || "Admin Sekolah"}</strong>!
            </p>
          </div>
          <div>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:bg-gray-400"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Kartu Statistik */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800">Ringkasan Data</h2>
          <dl className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard value={stats.totalMajors} label="Total Jurusan" />
            <StatCard value={stats.totalQuota} label="Total Kuota Siswa" />
            <StatCard value={stats.totalStudents} label="Siswa Terdaftar" />
            <StatCard value={`${stats.verifiedStudents} / ${stats.totalStudents}`} label="Siswa Terverifikasi" />
          </dl>
        </div>

        {/* Kartu Navigasi Aksi Cepat */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-800">Aksi Cepat</h2>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ActionCard
              href="/sekolah/manajemen-jurusan"
              title="Manajemen Jurusan"
              description="Tambah, edit, atau hapus daftar jurusan dan kuota siswa."
              icon="🎓"
            />
            <ActionCard
              href="/sekolah/verifikasi-siswa"
              title="Verifikasi Siswa"
              description="Lihat dan verifikasi akun siswa yang mendaftar dari sekolah Anda."
              icon="✅"
            />
            <ActionCard
              href="/sekolah/profil"
              title="Profil Sekolah"
              description="Perbarui informasi dan detail mengenai sekolah Anda."
              icon="🏫"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
