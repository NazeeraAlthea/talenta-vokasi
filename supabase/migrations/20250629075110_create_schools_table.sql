-- Migrasi #2 (Revisi Final): Membuat tipe data dan tabel untuk sekolah (Fokus SMK)

-- Membuat tipe kustom yang dibutuhkan oleh tabel schools
CREATE TYPE school_accreditation AS ENUM ('A', 'B', 'C', 'PROSES', 'BELUM');
CREATE TYPE school_level AS ENUM ('SMK');

-- Membuat tabel schools setelah tipe datanya didefinisikan
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    npsn VARCHAR(8) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    accreditation school_accreditation,
    level school_level, -- Kolom ini sekarang hanya bisa berisi 'SMK'
    address TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE schools IS 'Menyimpan profil detail untuk setiap sekolah mitra.';