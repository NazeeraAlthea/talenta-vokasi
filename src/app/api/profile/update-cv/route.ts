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

    const { cv_url } = await request.json();
    if (!cv_url || typeof cv_url !== 'string') {
      return NextResponse.json({ error: 'URL CV tidak valid.' }, { status: 400 });
    }

    // Update kolom cv_url di tabel students untuk pengguna yang sedang login
    const { error: updateError } = await supabase
      .from('students')
      .update({ cv_url: cv_url })
      .eq('user_id', session.user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ message: 'Profil CV berhasil diperbarui.' });

  } catch (error: any) {
    console.error('API Error update-cv:', error);
    return NextResponse.json({ error: 'Gagal memperbarui profil.' }, { status: 500 });
  }
}