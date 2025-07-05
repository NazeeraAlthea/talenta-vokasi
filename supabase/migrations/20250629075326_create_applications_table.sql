-- Migrasi #6 (Diperbaiki): Membuat tipe data dan tabel untuk lamaran

-- Membuat tipe kustom yang dibutuhkan oleh tabel applications
CREATE TYPE application_status AS ENUM ('APPLIED', 'VIEWED', 'INTERVIEW', 'ACCEPTED', 'REJECTED');

-- Membuat tabel applications setelah tipe datanya didefinisikan
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
    status application_status DEFAULT 'APPLIED',
    applied_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, listing_id)
);

COMMENT ON TABLE applications IS 'Mencatat setiap lamaran yang dikirim oleh siswa.';