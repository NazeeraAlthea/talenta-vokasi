// WAJIB: Gunakan "use client" karena kita akan menggunakan state (useState) dan interaksi (onClick)
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap } from 'lucide-react';

// Tipe data untuk peran agar lebih terstruktur dengan TypeScript
type Role = {
  id: 'siswa' | 'sekolah' | 'perusahaan';
  title: string;
  description: string;
};

export default function RegisterPage() {
  // State untuk menyimpan peran mana yang sedang dipilih oleh pengguna
  const [selectedRole, setSelectedRole] = useState<Role['id'] | null>(null);
  const router = useRouter();

  // Data untuk setiap pilihan peran, ini membuat kode lebih rapi
  const roles: Role[] = [
    {
      id: 'siswa',
      title: 'Siswa',
      description: 'Pelamar Praktek Kerja Lapangan',
    },
    {
      id: 'sekolah',
      title: 'Kordinator Sekolah',
      description: 'Penghubung Siswa dengan Perusahaan',
    },
    {
      id: 'perusahaan',
      title: 'Perusahaan',
      description: 'Mencari kandidat praktek kerja lapangan',
    },
  ];

  // Fungsi yang akan dijalankan saat tombol "Next" ditekan
  const handleNext = () => {
    if (selectedRole) {
      // Arahkan pengguna ke halaman registrasi yang sesuai dengan perannya
      router.push(`/register/${selectedRole}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Siapa Kamu?
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Pilih peranmu untuk melanjutkan pendaftaran.
          </p>
        </div>

        <div className="space-y-4">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              // Styling dinamis: berubah jika tombol ini sedang dipilih
              className={`flex w-full items-center space-x-4 rounded-lg border p-4 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                ${
                  selectedRole === role.id
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                    : 'border-gray-300 bg-white hover:bg-gray-100'
                }
              `}
            >
              <GraduationCap className={`h-8 w-8 ${selectedRole === role.id ? 'text-blue-600' : 'text-gray-500'}`} />
              <div>
                <p className="font-semibold text-gray-800">{role.title}</p>
                <p className="text-sm text-gray-500">{role.description}</p>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={!selectedRole} // Tombol akan nonaktif jika tidak ada peran yang dipilih
          className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          Next
        </button>

      </div>
    </div>
  );
}