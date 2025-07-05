-- Migrasi #5 (Diperbaiki): Membuat tipe data dan tabel untuk lowongan

-- Membuat tabel listings setelah tipe datanya didefinisikan
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE listings IS 'Menyimpan data setiap lowongan yang diposting perusahaan.';