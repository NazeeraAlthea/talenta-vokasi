"use client";

import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

// Tipe data untuk mempermudah
type Major = {
  id: string;
  name: string;
  quota: number;
  school_id: string;
};

type School = {
  id: string;
  name: string;
};

export default function ManajemenJurusanPage() {
  // State untuk data
  const [user, setUser] = useState<User | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [majors, setMajors] = useState<Major[]>([]);
  
  // State untuk form tambah jurusan
  const [newMajorName, setNewMajorName] = useState('');
  const [newMajorQuota, setNewMajorQuota] = useState<number>(0);

  // State untuk form edit (di dalam modal)
  const [editingMajor, setEditingMajor] = useState<Major | null>(null);
  const [editMajorName, setEditMajorName] = useState('');
  const [editMajorQuota, setEditMajorQuota] = useState<number>(0);

  // State untuk UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fungsi untuk mengambil semua data yang dibutuhkan
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // 1. Ambil data user yang sedang login
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Anda harus login untuk mengakses halaman ini.");
      setLoading(false);
      return;
    }
    setUser(user);

    // 2. Ambil profil sekolah berdasarkan user_id
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .select('id, name')
      .eq('user_id', user.id)
      .single();

    if (schoolError || !schoolData) {
      setError("Gagal mengambil data sekolah. Pastikan profil sekolah Anda lengkap.");
      setLoading(false);
      return;
    }
    setSchool(schoolData);

    // 3. Ambil daftar jurusan milik sekolah tersebut
    const { data: majorsData, error: majorsError } = await supabase
      .from('majors')
      .select('*')
      .eq('school_id', schoolData.id)
      .order('name', { ascending: true });

    if (majorsError) {
      setError("Gagal mengambil daftar jurusan.");
    } else {
      setMajors(majorsData || []);
    }

    setLoading(false);
  }, []);

  // Jalankan fetchData saat komponen pertama kali dimuat
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fungsi untuk menangani penambahan jurusan baru
  const handleAddMajor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMajorName || newMajorQuota <= 0 || !school) return;

    setSuccess(null);
    setError(null);

    const { error } = await supabase
      .from('majors')
      .insert({
        name: newMajorName.trim(),
        quota: newMajorQuota,
        school_id: school.id,
      });

    if (error) {
      setError(`Gagal menambahkan jurusan: ${error.message}`);
    } else {
      setSuccess('Jurusan berhasil ditambahkan.');
      setNewMajorName('');
      setNewMajorQuota(0);
      await fetchData(); // Ambil ulang data untuk memperbarui daftar
    }
  };

  // Fungsi untuk menangani penghapusan jurusan
  const handleDeleteMajor = async (majorId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus jurusan ini?")) return;
    
    setSuccess(null);
    setError(null);

    const { error } = await supabase
      .from('majors')
      .delete()
      .eq('id', majorId);

    if (error) {
      setError(`Gagal menghapus jurusan: ${error.message}`);
    } else {
      setSuccess('Jurusan berhasil dihapus.');
      await fetchData(); // Ambil ulang data
    }
  };

  // Fungsi untuk membuka modal edit
  const openEditModal = (major: Major) => {
    setEditingMajor(major);
    setEditMajorName(major.name);
    setEditMajorQuota(major.quota);
  };

  // Fungsi untuk menangani update jurusan
  const handleUpdateMajor = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingMajor) return;

      setSuccess(null);
      setError(null);

      const { error } = await supabase
          .from('majors')
          .update({ name: editMajorName.trim(), quota: editMajorQuota })
          .eq('id', editingMajor.id);
      
      if (error) {
          setError(`Gagal memperbarui jurusan: ${error.message}`);
      } else {
          setSuccess('Jurusan berhasil diperbarui.');
          setEditingMajor(null); // Tutup modal
          await fetchData(); // Ambil ulang data
      }
  };


  if (loading) {
    return <div className="p-8 text-center">Memuat data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Jurusan</h1>
        <p className="mt-1 text-gray-600">
          Kelola daftar jurusan dan kuota siswa untuk sekolah Anda, <strong>{school?.name || ''}</strong>.
        </p>

        {/* Form untuk Tambah Jurusan Baru */}
        <div className="mt-8 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">Tambah Jurusan Baru</h2>
          <form onSubmit={handleAddMajor} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label htmlFor="newMajorName" className="block text-sm font-medium text-gray-700">Nama Jurusan</label>
              <input
                id="newMajorName"
                type="text"
                value={newMajorName}
                onChange={(e) => setNewMajorName(e.target.value)}
                placeholder="Cth: Teknik Komputer dan Jaringan"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="newMajorQuota" className="block text-sm font-medium text-gray-700">Kuota Siswa</label>
              <input
                id="newMajorQuota"
                type="number"
                value={newMajorQuota}
                onChange={(e) => setNewMajorQuota(parseInt(e.target.value, 10))}
                required
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-3">
              <button type="submit" className="w-full rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700">
                + Tambah Jurusan
              </button>
            </div>
          </form>
        </div>

        {/* Notifikasi */}
        {error && <p className="mt-4 text-center text-red-600">{error}</p>}
        {success && <p className="mt-4 text-center text-green-600">{success}</p>}

        {/* Daftar Jurusan yang Sudah Ada */}
        <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg shadow ring-1 ring-black ring-opacity-5">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nama Jurusan</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Kuota</th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                        <span className="sr-only">Aksi</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {majors.length > 0 ? majors.map((major) => (
                                    <tr key={major.id}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{major.name}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{major.quota}</td>
                                        <td className="relative space-x-4 whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                            <button onClick={() => openEditModal(major)} className="text-blue-600 hover:text-blue-900">Edit</button>
                                            <button onClick={() => handleDeleteMajor(major.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="py-4 text-center text-gray-500">Belum ada jurusan yang ditambahkan.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

      </div>

      {/* Modal untuk Edit Jurusan */}
      {editingMajor && (
        <div className="fixed inset-0 z-10 overflow-y-auto bg-gray-500 bg-opacity-75">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="w-full max-w-md transform rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Edit Jurusan</h3>
                <form onSubmit={handleUpdateMajor} className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="editMajorName" className="block text-sm font-medium text-gray-700">Nama Jurusan</label>
                        <input
                            id="editMajorName"
                            type="text"
                            value={editMajorName}
                            onChange={(e) => setEditMajorName(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="editMajorQuota" className="block text-sm font-medium text-gray-700">Kuota Siswa</label>
                        <input
                            id="editMajorQuota"
                            type="number"
                            value={editMajorQuota}
                            onChange={(e) => setEditMajorQuota(parseInt(e.target.value, 10))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                    </div>
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                        <button type="submit" className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700">
                            Simpan Perubahan
                        </button>
                        <button type="button" onClick={() => setEditingMajor(null)} className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:mt-0">
                            Batal
                        </button>
                    </div>
                </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
