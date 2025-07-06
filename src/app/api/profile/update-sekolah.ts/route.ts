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

    // Ambil data dari form yang dikirim
    const formData = await request.json();

    // Update data di tabel 'schools' berdasarkan user_id yang login
    const { error: updateError } = await supabase
      .from('schools')
      .update({
        name: formData.name,
        npsn: formData.npsn,
        address: formData.address,
        accreditation: formData.accreditation,
        level: formData.level,
        logo_url: formData.logo_url, // URL logo baru jika ada
      })
      .eq('user_id', session.user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ message: 'Profil sekolah berhasil diperbarui.' });

  } catch (error: any) {
    console.error('API Error update-sekolah:', error);
    return NextResponse.json({ error: 'Gagal memperbarui profil sekolah.' }, { status: 500 });
  }
}