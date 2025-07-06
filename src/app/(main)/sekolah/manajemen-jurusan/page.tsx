"use client";

import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { Plus, Edit, Trash2, BookCopy, Users, X, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

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

  // menyimpan data untuk jurusan yang dihapus
  const [deletingMajor, setDeletingMajor] = useState<Major | null>(null);

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
    if (!newMajorName || !newMajorQuota || newMajorQuota <= 0 || !school) return;
    setSuccess(null); setError(null);
    const { error } = await supabase.from('majors').insert({ name: newMajorName.trim(), quota: newMajorQuota, school_id: school.id });
    if (error) { setError(`Gagal menambahkan jurusan: ${error.message}`); }
    else { setSuccess('Jurusan berhasil ditambahkan.'); setNewMajorName(''); setNewMajorQuota(0); await fetchData(); }
  };

  // Fungsi untuk menangani penghapusan jurusan
  // ✨ DIUBAH: Fungsi ini sekarang hanya untuk membuka modal
  const openDeleteModal = (major: Major) => {
    setError(null);
    setSuccess(null);
    setDeletingMajor(major);
  };

  // ✨ FUNGSI BARU: Untuk mengeksekusi penghapusan setelah dikonfirmasi dari modal
  const confirmDeleteMajor = async () => {
    if (!deletingMajor) return;

    setLoading(true); // Tampilkan loading di tombol modal
    const { error } = await supabase.from('majors').delete().eq('id', deletingMajor.id);
    setLoading(false);

    if (error) {
      setError(`Gagal menghapus jurusan: ${error.message}`);
    } else {
      setSuccess('Jurusan berhasil dihapus.');
      await fetchData(); // Ambil ulang data
    }
    setDeletingMajor(null); // Tutup modal
  };

  // Fungsi untuk membuka modal edit
  const openEditModal = (major: Major) => { setEditingMajor(major); setEditMajorName(major.name); setEditMajorQuota(major.quota); };

  // Fungsi untuk menangani update jurusan
  const handleUpdateMajor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMajor || !editMajorName || !editMajorQuota || editMajorQuota <= 0) return;
    setSuccess(null); setError(null);
    const { error } = await supabase.from('majors').update({ name: editMajorName.trim(), quota: editMajorQuota }).eq('id', editingMajor.id);
    if (error) { setError(`Gagal memperbarui jurusan: ${error.message}`); }
    else { setSuccess('Jurusan berhasil diperbarui.'); setEditingMajor(null); await fetchData(); }
  };


   if (loading && majors.length === 0) { return <div className="p-8 text-center text-lg font-medium text-gray-600">Memuat data...</div>; }

  const inputStyle = "mt-1 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600";

  const DeleteConfirmationModal = ({ major, onClose, onConfirm, loading }: { major: Major; onClose: () => void; onConfirm: () => void; loading: boolean; }) => (
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
            <h3 className="text-lg font-semibold leading-6 text-gray-900">
              Hapus Jurusan
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Anda yakin ingin menghapus jurusan <strong className="text-gray-900">{major.name}</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
          <button
            type="button"
            disabled={loading}
            className="inline-flex w-full justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 sm:w-auto disabled:bg-gray-400"
            onClick={onConfirm}
          >
            {loading ? "Menghapus..." : "Ya, Hapus"}
          </button>
          <button
            type="button"
            disabled={loading}
            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            onClick={onClose}
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Manajemen Jurusan</h1>
          <p className="mt-2 text-xl text-gray-600">Kelola daftar jurusan dan kuota siswa untuk <strong>{school?.name || "sekolah Anda"}</strong>.</p>
        </div>

        {/* Notifikasi Sukses & Error dengan Gaya Baru */}
        {error && <div className="mb-4 rounded-md bg-red-50 p-4"><div className="flex"><div className="flex-shrink-0"><AlertCircle className="h-5 w-5 text-red-400" /></div><div className="ml-3"><p className="text-sm font-medium text-red-800">{error}</p></div></div></div>}
        {success && <div className="mb-4 rounded-md bg-green-50 p-4"><div className="flex"><div className="flex-shrink-0"><CheckCircle className="h-5 w-5 text-green-400" /></div><div className="ml-3"><p className="text-sm font-medium text-green-800">{success}</p></div></div></div>}

        {/* Form Tambah Jurusan dengan Gaya Baru */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">Tambah Jurusan Baru</h2>
          <form onSubmit={handleAddMajor} className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="newMajorName" className="block text-sm font-medium text-gray-700">Nama Jurusan</label>
              <input id="newMajorName" type="text" value={newMajorName} onChange={(e) => setNewMajorName(e.target.value)} placeholder="Cth: Teknik Komputer dan Jaringan" required className={inputStyle} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="newMajorQuota" className="block text-sm font-medium text-gray-700">Kuota Siswa</label>
              <input id="newMajorQuota" type="number" value={newMajorQuota} onChange={(e) => setNewMajorQuota(e.target.value === '' ? 0 : parseInt(e.target.value, 10))} required min="1" className={inputStyle} />
            </div>
            <div className="sm:col-span-1 self-end">
              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <Plus size={16} /> Tambah
              </button>
            </div>
          </form>
        </div>

        {/* Tabel Jurusan dengan Gaya Baru */}
        <div className="mt-8 flow-root">
          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nama Jurusan</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Kuota</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Aksi</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {majors.length > 0 ? majors.map((major) => (
                  <tr key={major.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{major.name}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{major.quota}</td>
                    <td className="relative space-x-4 whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button onClick={() => openEditModal(major)} className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-900"><Edit size={14} /><span>Edit</span></button>
                      <button onClick={() => openDeleteModal(major)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-900"><Trash2 size={14} /><span>Hapus</span></button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="py-8 text-center text-gray-500">Belum ada jurusan yang ditambahkan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {deletingMajor && (
        <DeleteConfirmationModal
          major={deletingMajor}
          onClose={() => setDeletingMajor(null)}
          onConfirm={confirmDeleteMajor}
          loading={loading}
        />
      )}

      {/* Modal Edit dengan Gaya Baru */}
      {editingMajor && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Edit Jurusan</h3>
              <button onClick={() => setEditingMajor(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdateMajor} className="space-y-4">
              <div>
                <label htmlFor="editMajorName" className="block text-sm font-medium text-gray-700">Nama Jurusan</label>
                <input id="editMajorName" type="text" value={editMajorName} onChange={(e) => setEditMajorName(e.target.value)} className={inputStyle} />
              </div>
              <div>
                <label htmlFor="editMajorQuota" className="block text-sm font-medium text-gray-700">Kuota Siswa</label>
                <input id="editMajorQuota" type="number" value={editMajorQuota} onChange={(e) => setEditMajorQuota(e.target.value === '' ? 0 : parseInt(e.target.value, 10))} min="1" className={inputStyle} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setEditingMajor(null)} className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Batal</button>
                <button type="submit" className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
