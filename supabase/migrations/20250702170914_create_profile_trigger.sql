-- BAGIAN 1: FUNGSI HELPER
-- Fungsi ini akan dipanggil oleh trigger.
-- Tugasnya adalah membaca data dari user baru di tabel 'auth.users'
-- dan membuat profil yang sesuai di tabel 'students' atau 'schools'.

-- Cukup jalankan kode ini di Supabase SQL Editor untuk memperbarui fungsi Anda

create or replace function public.create_user_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Cek nilai 'role' yang kita kirim dari frontend
  if (new.raw_user_meta_data->>'role' = 'student') then
    -- Jika role-nya student, insert ke tabel students
    insert into public.students (user_id, full_name, nisn, school_id, major_id)
    values (
      new.id,
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'nisn',
      (new.raw_user_meta_data->>'school_id')::uuid,
      (new.raw_user_meta_data->>'major_id')::uuid
    );
  elsif (new.raw_user_meta_data->>'role' = 'school_admin') then
    -- Jika role-nya school_admin, insert ke tabel schools
    insert into public.schools (user_id, name, npsn, accreditation, level)
    values (
      new.id,
      new.raw_user_meta_data->>'school_name',
      new.raw_user_meta_data->>'npsn',
      (new.raw_user_meta_data->>'accreditation')::public.school_accreditation,
      (new.raw_user_meta_data->>'level')::public.school_level
    );

  -- ✨ DITAMBAHKAN: Blok untuk menangani registrasi perusahaan
  elsif (new.raw_user_meta_data->>'role' = 'company_admin') then
    -- Jika role-nya company_admin, insert ke tabel companies
    insert into public.companies (user_id, name, industry, website)
    values (
      new.id,
      new.raw_user_meta_data->>'company_name',
      new.raw_user_meta_data->>'industry',
      new.raw_user_meta_data->>'website'
    );
  end if;
  
  return new;
end;
$$;

-- BAGIAN 2: TRIGGER
-- Trigger ini "mengikat" fungsi di atas ke tabel 'auth.users'.
-- Ia akan berjalan secara otomatis SETELAH ada user baru yang berhasil dibuat.

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_user_profile();

