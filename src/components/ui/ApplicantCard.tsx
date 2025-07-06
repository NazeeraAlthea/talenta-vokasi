// components/ui/ApplicantCard.tsx

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Clock, ChevronDown } from 'lucide-react';
import supabase from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import StatusSelect from './StatusSelect'; // <-- 1. IMPORT KOMPONEN BARU

// Tipe data & Objek statusStyles tidak berubah...
type Student = { id: string; full_name: string; cv_url: string | null; schools: { name: string; } | null; };
type ApplicationStatus = 'APPLIED' | 'VIEWED' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED';
type Application = { id: string; status: ApplicationStatus; applied_at: string; students: Student | null; };
const statusStyles: { [key in ApplicationStatus]: { text: string; badgeColor: string; borderColor: string; } } = {
    APPLIED: { text: 'Terkirim', badgeColor: 'bg-blue-100 text-blue-800', borderColor: 'bg-blue-400' },
    VIEWED: { text: 'Dilihat', badgeColor: 'bg-purple-100 text-purple-800', borderColor: 'bg-purple-400' },
    INTERVIEW: { text: 'Wawancara', badgeColor: 'bg-orange-100 text-orange-800', borderColor: 'bg-orange-400' },
    ACCEPTED: { text: 'Diterima', badgeColor: 'bg-green-100 text-green-800', borderColor: 'bg-green-400' },
    REJECTED: { text: 'Ditolak', badgeColor: 'bg-red-100 text-red-800', borderColor: 'bg-red-400' },
};


export default function ApplicantCard({ application }: { application: Application }) {
  const [currentStatus, setCurrentStatus] = useState<ApplicationStatus>(application.status);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const student = application.students;
  if (!student) return null;

  const appliedDate = new Date(application.applied_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const style = statusStyles[currentStatus] || statusStyles.APPLIED;

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    setIsLoading(true);
    const { error } = await supabase.from('applications').update({ status: newStatus }).eq('id', application.id);

    if (error) {
      toast.error("Gagal mengubah status.");
    } else {
      toast.success(`Status diubah menjadi: ${statusStyles[newStatus].text}`);
      setCurrentStatus(newStatus);
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-300 relative overflow-hidden">
      <div className={`absolute left-0 top-0 h-full w-1.5 ${style.borderColor}`}></div>

      <div className="flex items-center p-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex-grow pl-3">
          <p className="text-lg font-semibold text-gray-900">{student.full_name}</p>
          <p className="text-sm text-gray-600">{student.schools?.name || 'Sekolah tidak tersedia'}</p>
        </div>
        <div className="flex items-center gap-4 ml-4">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${style.badgeColor}`}>{style.text}</span>
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-gray-200 bg-gray-50/50 px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock size={16} />
              <span>Melamar pada {appliedDate}</span>
            </div>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-3">
              {student.cv_url ? <Link href={student.cv_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"><FileText size={16} /> Lihat CV</Link> : <span className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-500">CV Tidak Ada</span>}
              
              {/* 2. GANTI <select> DENGAN KOMPONEN BARU */}
              <div onClick={(e) => e.stopPropagation()}>
                <StatusSelect 
                  currentStatus={currentStatus}
                  onStatusChange={handleStatusChange}
                  isLoading={isLoading}
                />
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}