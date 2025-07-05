"use client";

import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../lib/supabaseClient';

type StudentWithMajor = {
  id: string;
  full_name: string;
  nisn: string;
  verification_status: 'PENDING' | 'VERIFIED_BY_SCHOOL' | 'REJECTED';
  majors: {
    name: string;
  } | null;
};

type FilterStatus = 'PENDING' | 'VERIFIED_BY_SCHOOL' | 'REJECTED';

export default function VerifikasiSiswaPage() {
  const [students, setStudents] = useState<StudentWithMajor[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('PENDING');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Sesi tidak ditemukan, silakan login ulang.");
      setLoading(false);
      return;
    }

    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (schoolError || !schoolData) {
      setError("Profil sekolah tidak ditemukan.");
      setLoading(false);
      return;
    }

    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select(`
        id,
        full_name,
        nisn,
        verification_status,
        majors ( name )
      `)
      .eq('school_id', schoolData.id)
      .eq('verification_status', filterStatus)
      .order('created_at', { ascending: true });
    
    if (studentsError) {
      setError(`Gagal mengambil data siswa: ${studentsError.message}`);
    } else if (studentsData) {
      // PERUBAHAN DI SINI: Transformasi data manual
      const formattedData = studentsData.map(student => ({
        ...student,
        // Mengubah 'majors' dari array menjadi objek tunggal atau null
        majors: student.majors && Array.isArray(student.majors) && student.majors.length > 0 
                ? student.majors[0] 
                : null,
      }));
      setStudents(formattedData as StudentWithMajor[]);
    }

    setLoading(false);
  }, [filterStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStudentStatus = async (studentId: string, newStatus: FilterStatus) => {
    const { error } = await supabase
      .from('students')
      .update({ verification_status: newStatus })
      .eq('id', studentId);
    
    if (error) {
      setError(`Gagal memperbarui status siswa: ${error.message}`);
    } else {
      fetchData();
    }
  };
  
  const FilterButton = ({ status, label }: { status: FilterStatus; label: string }) => (
    <button
        onClick={() => setFilterStatus(status)}
        className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
    >
        {label}
    </button>
  );

  return (
    // ... Sisa kode JSX Anda tetap sama persis ...
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900">Verifikasi Siswa</h1>
        <p className="mt-1 text-gray-600">
          Setujui atau tolak siswa yang mendaftar dari sekolah Anda.
        </p>

        <div className="mt-6 border-b border-gray-200 pb-4">
          <div className="flex space-x-4">
            <FilterButton status="PENDING" label="Menunggu Persetujuan" />
            <FilterButton status="VERIFIED_BY_SCHOOL" label="Disetujui" />
            <FilterButton status="REJECTED" label="Ditolak" />
          </div>
        </div>

        {error && <p className="mt-4 text-center text-red-600">{error}</p>}

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden rounded-lg shadow ring-1 ring-black ring-opacity-5">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nama Lengkap</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">NISN</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Jurusan</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Aksi</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {loading ? (
                      <tr><td colSpan={4} className="py-4 text-center text-gray-500">Memuat siswa...</td></tr>
                    ) : students.length > 0 ? students.map((student) => (
                      <tr key={student.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{student.full_name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.nisn}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.majors?.name || 'N/A'}</td>
                        <td className="relative space-x-4 whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          {student.verification_status === 'PENDING' && (
                            <>
                              <button onClick={() => updateStudentStatus(student.id, 'VERIFIED_BY_SCHOOL')} className="text-green-600 hover:text-green-900">Verifikasi</button>
                              <button onClick={() => updateStudentStatus(student.id, 'REJECTED')} className="text-red-600 hover:text-red-900">Tolak</button>
                            </>
                          )}
                          {student.verification_status !== 'PENDING' && (
                              <span className="italic text-gray-400">Tidak ada aksi</span>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="py-4 text-center text-gray-500">Tidak ada siswa dalam kategori ini.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
