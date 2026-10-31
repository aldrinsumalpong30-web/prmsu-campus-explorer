-- PRMSU Campus Explorer: database structure, security rules and image storage.
-- Run in Supabase > SQL Editor. Safe to run more than once.

-- ---------- Tables ----------
create table if not exists categories (
  id            serial primary key,
  category_name text not null,
  description   text
);

create table if not exists buildings (
  id            serial primary key,
  building_name text not null,
  description   text,
  latitude      double precision not null,
  longitude     double precision not null
);

create table if not exists departments (
  id              serial primary key,
  department_name text not null,
  slug            text unique not null,
  category_id     int  not null references categories(id),
  building_id     int  references buildings(id) on delete set null,
  description     text,
  programs        text,
  image           text,
  contact_email   text,
  contact_number  text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table if not exists department_images (
  id            serial primary key,
  department_id int  not null references departments(id) on delete cascade,
  image_path    text not null,
  created_at    timestamptz default now()
);

-- Users listed here are administrators.
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- ---------- Helper: is the current user an admin? ----------
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;

-- ---------- Row Level Security ----------
alter table categories        enable row level security;
alter table buildings         enable row level security;
alter table departments       enable row level security;
alter table department_images enable row level security;
alter table admins            enable row level security;

-- Everyone can read the public tables.
drop policy if exists "read" on categories;        create policy "read" on categories        for select using (true);
drop policy if exists "read" on buildings;         create policy "read" on buildings         for select using (true);
drop policy if exists "read" on departments;       create policy "read" on departments       for select using (true);
drop policy if exists "read" on department_images; create policy "read" on department_images for select using (true);

-- Only admins can create, update or delete.
drop policy if exists "admin write" on categories;
create policy "admin write" on categories for all to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "admin write" on buildings;
create policy "admin write" on buildings for all to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "admin write" on departments;
create policy "admin write" on departments for all to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "admin write" on department_images;
create policy "admin write" on department_images for all to authenticated using (is_admin()) with check (is_admin());

-- A user can only see their own row in `admins`.
drop policy if exists "self" on admins;
create policy "self" on admins for select to authenticated using (user_id = auth.uid());

-- ---------- Image storage ----------
insert into storage.buckets (id, name, public)
values ('department-images', 'department-images', true)
on conflict do nothing;

drop policy if exists "img read" on storage.objects;
create policy "img read" on storage.objects for select using (bucket_id = 'department-images');
drop policy if exists "img insert" on storage.objects;
create policy "img insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'department-images' and public.is_admin());
drop policy if exists "img update" on storage.objects;
create policy "img update" on storage.objects for update to authenticated
  using (bucket_id = 'department-images' and public.is_admin());
drop policy if exists "img delete" on storage.objects;
create policy "img delete" on storage.objects for delete to authenticated
  using (bucket_id = 'department-images' and public.is_admin());
