import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // ... (kode otentikasi dan validasi Anda sebelumnya sudah benar) ...
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Tidak terotentikasi.' }, { status: 401 });
  }

  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', session.user.id)
    .single();
  
  if (companyError || !company) {
    return NextResponse.json({ error: 'Profil perusahaan tidak ditemukan.' }, { status: 404 });
  }

  const body = await request.json();
  const { title, description, location, category_id } = body;

  if (!title || !description || !category_id) {
    return NextResponse.json({ error: 'Judul, deskripsi, dan kategori wajib diisi.' }, { status: 400 });
  }

  // ✨ KODE YANG DIPERBAIKI ADA DI BAWAH INI ✨
  const { data, error: insertError } = await supabase
    .from('listings')
    .insert({
      company_id: company.id,
      title,
      description,
      location,
      category_id,
      is_active: true,
    })
    .select(); // DIUBAH: Hapus .single() dari akhir query ini.

  if (insertError) {
    console.error('Supabase insert error:', insertError);
    return NextResponse.json({ error: 'Gagal menyimpan lowongan ke database.' }, { status: 500 });
  }

  return NextResponse.json(data);
}