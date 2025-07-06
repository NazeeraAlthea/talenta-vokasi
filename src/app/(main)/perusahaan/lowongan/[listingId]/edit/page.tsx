// app/perusahaan/lowongan/[listingId]/edit/page.tsx

import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import EditListingForm from '@/components/forms/EditListingForm';

type PageProps = {
  params: { listingId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function EditListingPage({ params, searchParams }: PageProps) {
  const supabase = createServerComponentClient({ cookies });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // 1. Ambil data lowongan yang akan diedit
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id, title, description, location, category_id, company_id')
    .eq('id', params.listingId)
    .single();

  // 2. Ambil data perusahaan yang login untuk verifikasi kepemilikan
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', session.user.id)
    .single();

  // 3. Keamanan: Pastikan lowongan ada dan dimiliki oleh perusahaan yang login
  if (listingError || companyError || !listing || !company || listing.company_id !== company.id) {
    console.error('Error fetching or validating listing for edit:', listingError || companyError);
    return <div className="p-8 text-center text-red-500">Anda tidak berhak mengedit lowongan ini atau lowongan tidak ditemukan.</div>;
  }
  
  // 4. Ambil daftar kategori untuk dropdown
  const { data: categories } = await supabase
    .from('job_categories')
    .select('id, name')
    .order('name', { ascending: true });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 shadow-lg rounded-lg">
          <div className="mb-8 border-b pb-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Edit Lowongan</h1>
            <p className="mt-2 text-gray-600">Perbarui detail untuk posisi <span className="font-semibold">{listing.title}</span>.</p>
          </div>
          <EditListingForm listing={listing as any} categories={categories || []} />
        </div>
      </div>
    </div>
  );
}