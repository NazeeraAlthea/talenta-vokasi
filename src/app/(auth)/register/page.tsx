// WAJIB: Gunakan "use client" karena kita akan menggunakan state (useState) dan interaksi (onClick)
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User, School, Building } from 'lucide-react'; // DIUBAH: Impor ikon yang lebih relevan

// Tipe data untuk peran agar lebih terstruktur dengan TypeScript
type Role = {
  id: 'siswa' | 'sekolah' | 'perusahaan';
  title: string;
  description: string;
  icon: React.ElementType; // DIUBAH: Tambahkan properti ikon
};

export default function RegisterPage() {
  // State untuk menyimpan peran mana yang sedang dipilih oleh pengguna
  const [selectedRole, setSelectedRole] = useState<Role['id'] | null>(null);
  const router = useRouter();

  // DIUBAH: Data untuk setiap pilihan peran, sekarang termasuk ikon
  const roles: Role[] = [
    {
      id: 'siswa',
      title: 'Siswa',
      description: 'Saya mencari tempat magang atau PKL.',
      icon: User,
    },
    {
      id: 'sekolah',
      title: 'Perwakilan Sekolah',
      description: 'Saya ingin menyalurkan siswa.',
      icon: School,
    },
    {
      id: 'perusahaan',
      title: 'Perusahaan / Industri',
      description: 'Saya mencari talenta magang berkualitas.',
      icon: Building,
    },
  ];

  // Fungsi yang akan dijalankan saat tombol "Selanjutnya" ditekan
  const handleNext = () => {
    if (selectedRole) {
      // Arahkan pengguna ke halaman registrasi yang sesuai dengan perannya
      router.push(`/register/${selectedRole}`);
    }
  };

  return (
    // DIUBAH: Penyesuaian layout untuk mobile
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* BARU: Menambahkan logo di atas kartu */}
        <div className="mx-auto flex justify-center">
          <Link href="/">
            <Image
              src="/images/logo-talenta-vokasi.png" // Pastikan path ini benar
              alt="Logo Talenta Vokasi"
              width={100}
              height={50}
              priority
            />
          </Link>
        </div>

        <div className="rounded-lg bg-white p-6 sm:p-8 shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Bergabung Sebagai?
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Pilih peran Anda untuk memulai perjalanan bersama kami.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  // DIUBAH: Styling dinamis disesuaikan dengan brand
                  className={`flex w-full items-center space-x-4 rounded-lg border p-4 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500'
                        : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className={`h-8 w-8 flex-shrink-0 ${isSelected ? 'text-indigo-600' : 'text-gray-500'}`} />
                  <div>
                    <p className={`font-semibold ${isSelected ? 'text-indigo-800' : 'text-gray-800'}`}>{role.title}</p>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            <button
              onClick={handleNext}
              disabled={!selectedRole} // Tombol akan nonaktif jika tidak ada peran yang dipilih
              // DIUBAH: Styling tombol disesuaikan dengan brand
              className="w-full rounded-md bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}