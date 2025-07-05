-- File: supabase/seed.sql

-- Tambahkan kode ini ke dalam file seed.sql Anda
-- Kode ini aman dijalankan berkali-kali.

INSERT INTO public.job_categories (name) VALUES
  ('Teknologi Informasi'),
  ('Marketing & Komunikasi'),
  ('Administrasi & Pemerintahan'),
  ('Operasional & Gudang'),
  ('Layanan Perkantoran'),
  ('Desain & Kreatif'),
  ('Keuangan & Akuntansi'),
  ('Sumber Daya Manusia')
ON CONFLICT (name) DO NOTHING;