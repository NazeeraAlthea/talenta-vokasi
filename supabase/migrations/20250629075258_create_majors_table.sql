-- Migrasi: Membuat tabel untuk mengelola jurusan per sekolah
CREATE TABLE public.majors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    quota INT DEFAULT 0, -- Kolom untuk kuota siswa per jurusan
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Menjamin bahwa nama jurusan harus unik untuk setiap sekolah
    CONSTRAINT unique_major_per_school UNIQUE (school_id, name)
);

COMMENT ON TABLE public.majors IS 'Menyimpan daftar jurusan yang dimiliki oleh setiap sekolah.';
COMMENT ON COLUMN public.majors.school_id IS 'Menghubungkan jurusan ini ke sekolah spesifik.';
COMMENT ON COLUMN public.majors.quota IS 'Kapasitas maksimal siswa untuk jurusan ini.';
