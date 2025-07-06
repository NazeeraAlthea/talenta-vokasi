# 🚀 Talenta Vokasi

**Talenta Vokasi** adalah platform web modern yang dirancang untuk menjadi jembatan antara siswa sekolah kejuruan (SMK), pihak sekolah, dan dunia industri. Aplikasi ini memfasilitasi proses pencarian dan pelamaran magang, serta verifikasi siswa oleh sekolah untuk memastikan kualitas talenta yang ditawarkan.

---

## ✨ Fitur Utama

Platform ini memiliki tiga alur pengguna utama dengan fitur yang disesuaikan untuk masing-masing peran:

### 👩‍🎓 Untuk Siswa
- **Registrasi Profil:** Mendaftar dengan detail sekolah dan jurusan yang spesifik.
- **Pencarian Lowongan:** Mencari dan memfilter lowongan magang berdasarkan kategori.
- **Manajemen Dokumen:** Mengunggah dan mengelola CV untuk keperluan lamaran.
- **Proses Lamaran:** Melamar ke berbagai posisi magang dengan mudah.
- **Status Verifikasi:** Melihat status verifikasi akun yang dilakukan oleh sekolah.
- **Riwayat Lamaran:** Melacak status dari setiap lamaran yang telah dikirim.

### 🏫 Untuk Sekolah
- **Manajemen Profil Sekolah:** Mengelola data dan logo sekolah.
- **Verifikasi Siswa:** Memvalidasi dan menyetujui siswa yang mendaftar di bawah nama sekolah.
- **Manajemen Jurusan:** Mengelola daftar jurusan yang tersedia di sekolah.

### 🏢 Untuk Perusahaan
- **Manajemen Profil Perusahaan:** Mengelola detail dan logo perusahaan.
- **Publikasi Lowongan:** Membuat, mengedit, dan mempublikasikan lowongan magang.
- **Manajemen Pelamar:** Melihat dan me-review daftar siswa yang melamar ke sebuah lowongan.
- **Ubah Status Pelamar:** Mengubah status lamaran siswa (Dilihat, Wawancara, Diterima, Ditolak).

---

## 🛠️ Teknologi yang Digunakan

Proyek ini dibangun dengan tumpukan teknologi modern yang cepat dan skalabel:

-   **Framework:** [Next.js](https://nextjs.org/) (App Router)
-   **Bahasa:** [TypeScript](https://www.typescriptlang.org/)
-   **Backend & Database:** [Supabase](https://supabase.io/) (Auth, Postgres, Storage)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Komponen:** [Radix UI](https://www.radix-ui.com/) & [Lucide React](https://lucide.dev/) (untuk ikon)
-   **Notifikasi:** [React Hot Toast](https://react-hot-toast.com/)

---

## ⚙️ Instalasi & Setup Lokal

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di lingkungan lokal Anda.

### 1. Prasyarat
- [Node.js](https://nodejs.org/en/) (v18 atau lebih baru)
- [Docker](https://www.docker.com/products/docker-desktop/) (diperlukan untuk Supabase CLI)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

### 2. Clone Repositori
```bash
git clone [https://github.com/NazeeraAlthea/talenta-vokasi.git](https://github.com/NazeeraAlthea/talenta-vokasi.git)
cd talenta-vokasi
```

### 3. Instal Dependensi
```bash
npm install
```

### 4. Setup Lingkungan Supabase Lokal
- Inisialisasi Supabase di proyek Anda jika belum ada:
  ```bash
  npx supabase init
  ```
- Jalankan layanan Supabase (termasuk database) di Docker:
  ```bash
  npx supabase start
  ```
- Setelah selesai, terminal akan memberikan Anda **URL API** dan **Anon Key** untuk lingkungan lokal.

### 5. Konfigurasi Environment Variable
- Buat file baru bernama `.env.local` di root proyek.
- Salin dan tempel variabel berikut, ganti nilainya dengan yang Anda dapatkan dari perintah `supabase start`.
  ```env
  NEXT_PUBLIC_SUPABASE_URL=[http://127.0.0.1:54321](http://127.0.0.1:54321)
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key-here
  ```

### 6. Terapkan Migrasi Database
- Jalankan perintah ini untuk membuat semua tabel dan skema yang diperlukan di database lokal Anda.
  ```bash
  npx supabase db reset
  ```

### 7. Jalankan Aplikasi
```bash
npm run dev
```

Aplikasi sekarang dovrebbe berjalan di [http://localhost:3000](http://localhost:3000).

---

Dibuat dengan ❤️ untuk kemajuan talenta vokasi Indonesia.
