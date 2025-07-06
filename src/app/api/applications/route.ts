// app/api/applications/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { listing_id } = await request.json();
  const supabase = createRouteHandlerClient({ cookies });

  // Ambil sesi pengguna yang sedang login
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const userId = session.user.id;

  try {
    // --- PENAMBAHAN LOGIKA VERIFIKASI DI SINI ---
    // 1. Ambil profil siswa untuk memeriksa status verifikasi
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, verification_status')
      .eq('user_id', userId)
      .single();

    if (studentError || !student) {
      throw new Error('Profil siswa tidak ditemukan.');
    }

    // 2. Jika status BUKAN 'VERIFIED_BY_SCHOOL', tolak permintaan
    if (student.verification_status !== 'VERIFIED_BY_SCHOOL') {
      return new Response(
        JSON.stringify({ error: 'Akun Anda harus diverifikasi oleh sekolah sebelum dapat melamar.' }),
        { status: 403 } // 403 Forbidden adalah status yang tepat
      );
    }
    // --- AKHIR DARI LOGIKA VERIFIKASI ---

    // 3. Jika terverifikasi, lanjutkan proses pembuatan lamaran
    const { error: insertError } = await supabase
      .from('applications')
      .insert({
        listing_id: listing_id,
        student_id: student.id, // Gunakan ID dari profil siswa yang sudah diambil
        // status akan diisi DEFAULT 'APPLIED' oleh database
      });

    if (insertError) throw insertError;

    return NextResponse.json({ message: 'Lamaran berhasil dikirim!' });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}