-- Migrasi #4 (Final): Membuat tipe data dan tabel untuk siswa

-- Membuat tipe kustom yang dibutuhkan oleh tabel students
CREATE TYPE public.verification_status AS ENUM ('PENDING', 'VERIFIED_BY_SCHOOL', 'REJECTED');

-- Membuat tabel students dengan relasi ke schools dan majors
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    major_id UUID REFERENCES public.majors(id) ON DELETE SET NULL, -- DITAMBAHKAN DI SINI
    nisn VARCHAR(10) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    cv_url TEXT,
    portfolio_url TEXT,
    verification_status public.verification_status DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.students IS 'Menyimpan profil detail untuk setiap siswa.';
COMMENT ON COLUMN public.students.major_id IS 'Menghubungkan siswa ke jurusan spesifik mereka di tabel majors.';

