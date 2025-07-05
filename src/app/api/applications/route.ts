import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi.' }, { status: 401 });
    }

    // Ambil ID profil siswa berdasarkan user_id yang login
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: 'Profil siswa tidak ditemukan.' }, { status: 404 });
    }
    
    const { listing_id, cover_letter } = await request.json();
    if (!listing_id) {
      return NextResponse.json({ error: 'ID lowongan wajib diisi.' }, { status: 400 });
    }

    // Masukkan data lamaran baru
    const { data, error: insertError } = await supabase
      .from('applications')
      .insert({
        student_id: student.id,
        listing_id: listing_id,
        // Anda bisa menambahkan 'cover_letter' ke tabel 'applications' jika perlu
        status: 'Terkirim', // Status awal lamaran
      });

    if (insertError) {
      // Cek jika error karena sudah pernah melamar (unique constraint)
      if (insertError.code === '23505') { // Kode error untuk unique violation
        return NextResponse.json({ error: 'Anda sudah pernah melamar di lowongan ini.' }, { status: 409 });
      }
      throw insertError;
    }

    return NextResponse.json({ message: 'Lamaran berhasil dikirim!' });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}