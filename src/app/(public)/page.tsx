  import { cookies } from 'next/headers';
  import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
  import Link from 'next/link';
  import Image from 'next/image';
  import { Briefcase, Building, School, ArrowRight, Menu } from 'lucide-react';
  

  // Tipe data untuk lowongan
  type Listing = {
    id: string;
    title: string;
    location: string;
    companies: {
      name: string;
      logo_url: string | null;
    } | null;
  };

  // Komponen Kartu Lowongan
  function ListingCard({ listing }: { listing: Listing }) {
    const companyName = listing.companies?.name || 'Perusahaan';
    const initial = companyName.charAt(0) || '?';

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {listing.companies?.logo_url ? (
              <Image src={listing.companies.logo_url} alt={`${companyName} logo`} width={48} height={48} className="rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-lg">
                {initial}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-800 hover:text-indigo-600">
              <Link href={`/lowongan/${listing.id}`}>{listing.title}</Link>
            </h3>
            <p className="text-sm text-gray-600">{companyName}</p>
            <p className="text-sm text-gray-500 mt-1">{listing.location}</p>
          </div>
        </div>
      </div>
    );
  }

  // Komponen Header
  function Header() {
    return (
      <header className="absolute top-0 left-0 w-full z-10">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* DIUBAH: Link sekarang hanya sebagai pembungkus, tanpa styling teks */}
          <Link href="/">
            {/* DIUBAH: Gunakan width & height yang pasti, hapus fill & className */}
            <Image
              src="/images/logo-talenta-vokasi.png"
              alt="Logo Talenta Vokasi"
              width={120}  // Atur lebar logo yang diinginkan
              height={40}   // Atur tinggi logo yang sesuai
              priority      // 'priority' sudah benar agar logo dimuat lebih dulu
              className='h-auto'
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-white hover:text-indigo-300 transition-colors">Masuk</Link>
            <Link href="/register" className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow hover:bg-gray-200 transition-colors">Daftar Sekarang</Link>
          </nav>
          <div className="md:hidden">
            <button className="text-white p-2">
              <Menu />
            </button>
          </div>
        </div>
      </header>
    );
  }


  // Komponen Utama Halaman
  export default async function HomePage() {
    const supabase = createServerComponentClient({ cookies });

    const { data: listings } = await supabase
      .from('listings')
      .select(`id, title, location, companies ( name, logo_url )`)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(6);

    const cleanListings = listings?.map(l => ({
      ...l,
      companies: Array.isArray(l.companies) ? l.companies[0] : l.companies
    })) || [];

    return (
      <div className="bg-white text-gray-800">
        <Header />

        {/* 1. Bagian Hero */}
        <section className="relative bg-gray-900 text-white pt-20"> {/* Tambahkan pt-20 untuk memberi ruang bagi header */}
          <div className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
              Gerbang Karir Vokasi <span className="text-indigo-400">Terbaik</span> di Indonesia
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-gray-300">
              Hubungkan talenta vokasi berprestasi dengan perusahaan inovatif dan sekolah unggulan.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/lowongan" className="w-full sm:w-auto rounded-md bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-indigo-500 transition-transform duration-200 hover:scale-105">
                Cari Lowongan Magang
              </Link>
              <Link href="/register/perusahaan" className="w-full sm:w-auto rounded-md bg-white px-8 py-3 text-base font-semibold text-indigo-600 shadow-lg hover:bg-gray-200 transition-transform duration-200 hover:scale-105">
                Rekrut Talenta
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Bagian Penjelasan Nilai */}
        <section className="py-16 sm:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">Platform untuk Semua</h2>
              <p className="mt-4 text-lg text-gray-600">Satu ekosistem untuk mendukung pertumbuhan karir dan industri.</p>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-white rounded-xl shadow-md">
                <School className="mx-auto h-12 w-12 text-indigo-600" />
                <h3 className="mt-6 text-xl font-semibold">Untuk Sekolah</h3>
                <p className="mt-2 text-gray-600">Tingkatkan reputasi dan salurkan lulusan terbaik Anda ke industri terdepan.</p>
              </div>
              <div className="text-center p-8 bg-white rounded-xl shadow-md">
                <Briefcase className="mx-auto h-12 w-12 text-indigo-600" />
                <h3 className="mt-6 text-xl font-semibold">Untuk Siswa</h3>
                <p className="mt-2 text-gray-600">Temukan kesempatan magang impian, bangun portofolio, dan mulai karir lebih awal.</p>
              </div>
              <div className="text-center p-8 bg-white rounded-xl shadow-md">
                <Building className="mx-auto h-12 w-12 text-indigo-600" />
                <h3 className="mt-6 text-xl font-semibold">Untuk Perusahaan</h3>
                <p className="mt-2 text-gray-600">Dapatkan akses ke ribuan talenta terverifikasi yang memiliki keahlian praktis.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Bagian Preview Lowongan */}
        {cleanListings.length > 0 && (
          <section className="py-16 sm:py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-3xl font-bold tracking-tight">Lowongan Magang Terbaru</h2>
                <p className="mt-4 text-lg text-gray-600">Kesempatan terbaik menanti Anda. Lamar sekarang!</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cleanListings.map(listing => (
                  <ListingCard key={listing.id} listing={listing as Listing} />
                ))}
              </div>
              <div className="mt-12 text-center">
                <Link href="/lowongan" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:underline">
                  Lihat Semua Lowongan <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* 4. Bagian Panggilan Aksi Terakhir */}
        <section className="py-20 bg-indigo-700 text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">Siap Memulai Perjalanan Anda?</h2>
            <p className="mt-4 text-lg text-indigo-200">Bergabunglah sekarang dan jadilah bagian dari ekosistem vokasi masa depan.</p>
            <div className="mt-8">
              <Link href="/register/siswa" className="inline-block rounded-md bg-white px-8 py-3 text-base font-semibold text-indigo-600 shadow-lg hover:bg-gray-200 transition-transform duration-200 hover:scale-105">
                Daftar Sebagai Siswa
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-gray-400">
          <div className="max-w-7xl mx-auto py-12 px-6">
            <div className="text-center">
              <p className="text-lg font-semibold text-white">Talenta Vokasi</p>
              <p className="mt-2 text-sm">&copy; {new Date().getFullYear()} Talenta Vokasi. Semua Hak Cipta Dilindungi.</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }