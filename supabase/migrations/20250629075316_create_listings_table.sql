-- Migrasi #5 (Diperbaiki): Membuat tipe data dan tabel untuk lowongan

-- Membuat tipe kustom yang dibutuhkan oleh tabel listings
CREATE TYPE listing_type AS ENUM ('INTERNSHIP', 'FULL_TIME', 'PART_TIME');

-- Membuat tabel listings setelah tipe datanya didefinisikan
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type listing_type NOT NULL,
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE listings IS 'Menyimpan data setiap lowongan yang diposting perusahaan.';