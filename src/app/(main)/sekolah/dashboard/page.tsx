"use client";

import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookCopy, BadgeCheck, Users, Library, LogOut, UserCircle, ChevronDown } from 'lucide-react';

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
const ActionCard = ({ href, title, description, icon: Icon }: { href: string; title: string; description: string; icon: React.ElementType; }) => (
    <Link href={href} className="group block rounded-xl border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-indigo-300">
        <div className="flex items-start">
            <Icon className="h-10 w-10 text-indigo-600 transition-transform duration-300 group-hover:scale-110" />
            <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="mt-1 text-sm text-gray-600">{description}</p>
            </div>
        </div>
    </Link>
);

// Komponen untuk kartu statistik
const StatCard = ({ value, label, icon: Icon }: { value: number | string; label: string; icon: React.ElementType }) => (
    <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200">
        <div className="p-5">
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    <Icon className="h-8 w-8 text-indigo-500" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                    <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{label}</dt>
                        <dd className="text-3xl font-semibold text-gray-900">{value}</dd>
                    </dl>
                </div>
            </div>
        </div>
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
        // Latar belakang utama halaman
        <div className="min-h-screen bg-gray-100">
            {/* Header tidak lagi diperlukan di sini karena sudah ada di (main)/layout.tsx */}
            
            <main className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Judul Halaman */}
                    <div className="mb-10">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Dashboard Sekolah</h1>
                        <p className="mt-2 text-xl text-gray-600">
                            Selamat datang kembali, <strong>{school?.name || "Admin Sekolah"}</strong>!
                        </p>
                    </div>

                    {/* Kartu Statistik */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Ringkasan Data</h2>
                        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            <StatCard value={stats.totalMajors} label="Total Jurusan" icon={BookCopy} />
                            <StatCard value={stats.totalStudents} label="Siswa Terdaftar" icon={Users} />
                            <StatCard value={`${stats.verifiedStudents} / ${stats.totalStudents}`} label="Siswa Terverifikasi" icon={BadgeCheck} />
                            <StatCard value={stats.totalQuota} label="Total Kuota Penerimaan" icon={Library} />
                        </dl>
                    </div>

                    {/* Kartu Navigasi Aksi Cepat */}
                    <div className="mt-12">
                        <h2 className="text-xl font-semibold text-gray-800">Aksi Cepat</h2>
                        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <ActionCard
                                href="/sekolah/manajemen-jurusan"
                                title="Manajemen Jurusan"
                                description="Tambah, edit, atau hapus daftar jurusan dan kuota siswa."
                                icon={BookCopy}
                            />
                            <ActionCard
                                href="/sekolah/verifikasi-siswa"
                                title="Verifikasi Siswa"
                                description="Lihat dan verifikasi akun siswa yang mendaftar dari sekolah Anda."
                                icon={BadgeCheck}
                            />
                            <ActionCard
                                href="/sekolah/profil"
                                title="Profil Sekolah"
                                description="Perbarui informasi dan detail mengenai sekolah Anda."
                                icon={Library}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
