-- LANGKAH 1: Membuat bucket 'logos' dan menjadikannya publik.
-- Opsi { "public": true } sama dengan mencentang kotak "Public bucket" di dashboard.
-- Opsi { "allowedMimeTypes": ["image/jpeg", "image/png", "image/webp"] } adalah bonus untuk keamanan.
-- SELECT storage.create_bucket(
--     'logos',
--     '{ "public": true, "allowedMimeTypes": ["image/jpeg", "image/png", "image/webp"] }'
-- );


-- LANGKAH 2: Menerapkan semua kebijakan RLS untuk bucket 'logos'

-- Kebijakan untuk mengizinkan public read pada bucket 'logos'
CREATE POLICY "Allow public read on logos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'logos' );

-- Kebijakan untuk mengizinkan pengguna yang terotentikasi mengunggah logo
CREATE POLICY "Allow authenticated users to upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'logos' AND auth.uid() = (storage.foldername(name))[1]::uuid );

-- Kebijakan untuk mengizinkan pengguna yang terotentikasi mengubah logo mereka sendiri
CREATE POLICY "Allow authenticated users to update logos"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'logos' AND auth.uid() = (storage.foldername(name))[1]::uuid );

-- Kebijakan untuk mengizinkan pengguna yang terotentikasi menghapus logo mereka sendiri
CREATE POLICY "Allow authenticated users to delete logos"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'logos' AND auth.uid() = (storage.foldername(name))[1]::uuid );