-- supabase/migrations/20250705231800_add_rls_policies_for_storage.sql

-- Kebijakan untuk mengizinkan public read
CREATE POLICY "Allow public read access to CVs"
ON storage.objects FOR SELECT
USING ( bucket_id = 'cvs' );

-- Kebijakan untuk mengizinkan upload oleh pengguna terotentikasi
CREATE POLICY "Allow authenticated users to upload their own CV"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'cvs' AND auth.uid() = (storage.foldername(name))[1]::uuid );

-- Kebijakan untuk mengizinkan update oleh pemilik file
CREATE POLICY "Allow authenticated users to update their own CV"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'cvs' AND auth.uid() = (storage.foldername(name))[1]::uuid );

-- Kebijakan untuk mengizinkan delete oleh pemilik file
CREATE POLICY "Allow authenticated users to delete their own CV"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'cvs' AND auth.uid() = (storage.foldername(name))[1]::uuid );