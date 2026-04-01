-- Run this in Supabase SQL Editor to fix:
-- "Database error saving new user"

-- 1) Ensure profiles table exists
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  created_at timestamptz default now()
);

-- 2) RLS for profiles
alter table public.profiles enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can view own profile'
  ) then
    create policy "Users can view own profile"
      on public.profiles
      for select
      to authenticated
      using (auth.uid() = id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can update own profile'
  ) then
    create policy "Users can update own profile"
      on public.profiles
      for update
      to authenticated
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end $$;

-- 3) Safe trigger function for new auth users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do update
    set email = excluded.email,
        name = coalesce(public.profiles.name, excluded.name);

  return new;
exception
  when undefined_table then
    -- Do not block signup if profiles table is unavailable.
    return new;
end;
$$;

-- 4) Recreate trigger on auth.users

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
