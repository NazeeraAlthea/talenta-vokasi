-- Membuat skema-skema yang dibutuhkan oleh ekstensi Supabase
create schema if not exists "auth";
create schema if not exists "extensions";
create schema if not exists "graphql";
create schema if not exists "pgsodium";
-- skema realtime sengaja dihapus untuk sementara
create schema if not exists "storage";

-- Mengaktifkan ekstensi-ekstensi penting Supabase
create extension if not exists "pg_graphql" with schema "graphql";
create extension if not exists "pg_net" with schema "extensions";
create extension if not exists "pgsodium" with schema "pgsodium";
create extension if not exists "pgtap" with schema "extensions";
-- ekstensi realtime sengaja dihapus untuk sementara
create extension if not exists "storage" with schema "storage";
create extension if not exists "supabase_auth_admin" with schema "auth";
create extension if not exists "uuid-ossp" with schema "extensions";