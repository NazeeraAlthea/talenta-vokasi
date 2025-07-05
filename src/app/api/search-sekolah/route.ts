// Lokasi file: src/app/api/search-sekolah/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Ambil query pencarian dari URL, contoh: /api/search-sekolah?q=SMK%20Telkom
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query pencarian dibutuhkan' }, { status: 400 });
  }

  try {
    // Panggil API Kemendikbud dari sisi server untuk menghindari masalah CORS
    const response = await fetch(`https://referensi.data.kemdikbud.go.id/index11.php?kode=000000&level=3&q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
        throw new Error(`Gagal mengambil data dari API Kemendikbud, status: ${response.status}`);
    }

    // API Kemendikbud mengembalikan data dalam format yang tidak biasa (bukan JSON standar)
    // Kita perlu mem-parsingnya secara manual.
    const text = await response.text();
    
    // Logika parsing untuk mengubah data mentah menjadi array yang bisa digunakan
    const lines = text.trim().split('\n');
    const schools = lines.map(line => {
        const parts = line.split('||');
        if (parts.length >= 2) {
            const nameAndDetails = parts[0];
            const npsn = parts[1].trim();

            // Membersihkan nama sekolah dari detail tambahan
            const schoolName = nameAndDetails.split('(')[0].trim();
            
            return { nama: schoolName, npsn: npsn };
        }
        return null;
    }).filter(Boolean); // Menghapus hasil null jika ada baris yang formatnya salah

    return NextResponse.json(schools);

  } catch (error) {
    console.error('API Proxy Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan di server saat mencari sekolah.' }, { status: 500 });
  }
}
