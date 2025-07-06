-- LANGKAH 1: Membuat bucket 'cvs' dan menjadikannya NON-PUBLIK.
-- CV berisi data pribadi, jadi "public" diatur ke "false".
-- Hanya pengguna yang memiliki akses yang dapat melihatnya.
-- File yang diizinkan adalah PDF dan dokumen Word (.docx).
-- SELECT storage.create_bucket(
--     'cvs',
--     '{ "public": false, "allowedMimeTypes": ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] }'
-- );


-- LANGKAH 2: Menerapkan semua kebijakan RLS untuk bucket 'cvs'

-- Kebijakan untuk mengizinkan PEMILIK membaca CV mereka sendiri (BUKAN PUBLIK)
CREATE POLICY "Allow owner to read their own CV"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'cvs' AND auth.uid() = (storage.foldername(name))[1]::uuid );

-- Kebijakan untuk mengizinkan pengguna yang terotentikasi mengunggah CV
CREATE POLICY "Allow authenticated users to upload their own CV"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'cvs' AND auth.uid() = (storage.foldername(name))[1]::uuid );

-- Kebijakan untuk mengizinkan pengguna yang terotentikasi mengubah CV mereka sendiri
CREATE POLICY "Allow authenticated users to update their own CV"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'cvs' AND auth.uid() = (storage.foldername(name))[1]::uuid );

-- Kebijakan untuk mengizinkan pengguna yang terotentikasi menghapus CV mereka sendiri
CREATE POLICY "Allow authenticated users to delete their own CV"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'cvs' AND auth.uid() = (storage.foldername(name))[1]::uuid );