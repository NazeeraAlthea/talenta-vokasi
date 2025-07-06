"use client";

import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { Check, X, Clock, UserCheck, UserX, AlertCircle } from 'lucide-react';

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
  const [allStudents, setAllStudents] = useState<StudentWithMajor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    // ... (logika ambil user dan school id Anda)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { /* ... handle error ... */ return; }
    const { data: schoolData, error: schoolError } = await supabase.from('schools').select('id').eq('user_id', user.id).single();
    if (schoolError || !schoolData) { /* ... handle error ... */ return; }

    const { data: studentsData, error: studentsError } = await supabase
      .from('students').select(`id, full_name, nisn, verification_status, majors ( name )`)
      .eq('school_id', schoolData.id).order('created_at', { ascending: true });

    if (studentsError) { setError(`Gagal mengambil data siswa: ${studentsError.message}`); }
    else if (studentsData) {
      const formattedData = studentsData.map(student => ({ ...student, majors: student.majors && Array.isArray(student.majors) && student.majors.length > 0 ? student.majors[0] : null, }));
      setAllStudents(formattedData as StudentWithMajor[]);
    }
    setLoading(false);
  }, []);


  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const updateStudentStatus = async (studentId: string, newStatus: FilterStatus) => {
    const { error } = await supabase
      .from('students')
      .update({ verification_status: newStatus })
      .eq('id', studentId);

    if (error) {
      setError(`Gagal memperbarui status siswa: ${error.message}`);
    } else {
      fetchAllData();
    }
  };

  const filteredStudents = allStudents.filter(s => s.verification_status === filterStatus);
  const pendingCount = allStudents.filter(s => s.verification_status === 'PENDING').length;
  const verifiedCount = allStudents.filter(s => s.verification_status === 'VERIFIED_BY_SCHOOL').length;
  const rejectedCount = allStudents.filter(s => s.verification_status === 'REJECTED').length;

  if (loading) { return <div className="flex h-screen items-center justify-center text-lg font-medium text-gray-600">Memuat data verifikasi...</div>; }
  if (error) { return <div className="p-8 text-center text-red-500">{error}</div>; }

  const FilterButton = ({ status, label, count, currentFilter, setFilter, icon: Icon }: { status: FilterStatus; label: string; count: number; currentFilter: FilterStatus; setFilter: (status: FilterStatus) => void; icon: React.ElementType }) => {
    const isActive = currentFilter === status;
    return (
      <button
        onClick={() => setFilter(status)}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${isActive
          ? 'bg-indigo-600 text-white shadow-md'
          : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
      >
        <Icon size={16} />
        <span>{label}</span>
        <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${isActive ? 'bg-white text-indigo-600' : 'bg-gray-200 text-gray-800'
          }`}>
          {count}
        </span>
      </button>
    );
  };

  return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-10">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">Verifikasi Siswa</h1>
                    <p className="mt-2 text-xl text-gray-600">Setujui atau tolak pendaftaran siswa dari sekolah Anda.</p>
                </div>

                {/* Tombol Filter dengan Gaya Baru */}
                <div className="flex space-x-2 rounded-xl bg-gray-200 p-1.5">
                    <FilterButton status="PENDING" label="Menunggu Persetujuan" count={pendingCount} currentFilter={filterStatus} setFilter={setFilterStatus} icon={Clock} />
                    <FilterButton status="VERIFIED_BY_SCHOOL" label="Disetujui" count={verifiedCount} currentFilter={filterStatus} setFilter={setFilterStatus} icon={UserCheck} />
                    <FilterButton status="REJECTED" label="Ditolak" count={rejectedCount} currentFilter={filterStatus} setFilter={setFilterStatus} icon={UserX} />
                </div>
                
                {/* Tabel dengan Gaya Baru */}
                <div className="mt-8 flow-root">
                    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nama Lengkap</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">NISN</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Jurusan</th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Aksi</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{student.full_name}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.nisn}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.majors?.name || 'N/A'}</td>
                                        <td className="relative space-x-4 whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                            {student.verification_status === 'PENDING' && (
                                                <>
                                                    <button onClick={() => updateStudentStatus(student.id, 'VERIFIED_BY_SCHOOL')} className="inline-flex items-center gap-1.5 rounded-md bg-green-100 px-3 py-1.5 text-sm font-semibold text-green-700 shadow-sm hover:bg-green-200">
                                                        <Check size={16} /> Verifikasi
                                                    </button>
                                                    <button onClick={() => updateStudentStatus(student.id, 'REJECTED')} className="inline-flex items-center gap-1.5 rounded-md bg-red-100 px-3 py-1.5 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-200">
                                                        <X size={16} /> Tolak
                                                    </button>
                                                </>
                                            )}
                                            {student.verification_status !== 'PENDING' && ( <span className="italic text-gray-400">Tindakan selesai</span> )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} className="py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <AlertCircle className="h-10 w-10 text-gray-400" />
                                            <span>Tidak ada siswa dalam kategori ini.</span>
                                        </div>
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
