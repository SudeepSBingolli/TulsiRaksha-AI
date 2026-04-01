-- Run in Supabase SQL Editor (PostgreSQL)
-- Ensures profile pages can read and update current user data safely.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.user_details (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text,
  gender text,
  date_of_birth date,
  address text,
  city text,
  state text,
  country text,
  pincode text,
  occupation text,
  company text,
  experience text,
  bio text,
  website text,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.user_details enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_select_own'
  ) then
    create policy profiles_select_own
      on public.profiles
      for select
      to authenticated
      using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_upsert_own'
  ) then
    create policy profiles_upsert_own
      on public.profiles
      for all
      to authenticated
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_details' and policyname = 'user_details_select_own'
  ) then
    create policy user_details_select_own
      on public.user_details
      for select
      to authenticated
      using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_details' and policyname = 'user_details_upsert_own'
  ) then
    create policy user_details_upsert_own
      on public.user_details
      for all
      to authenticated
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  insert into public.user_details (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
