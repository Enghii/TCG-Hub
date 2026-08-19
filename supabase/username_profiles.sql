create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  updated_at timestamptz not null default now(),
  constraint username_format check (username is null or username ~ '^[a-z0-9_]{3,20}$')
);

alter table public.user_profiles enable row level security;
drop policy if exists "Users read their own profile" on public.user_profiles;
drop policy if exists "Users insert their own profile" on public.user_profiles;
drop policy if exists "Users update their own profile" on public.user_profiles;
create policy "Users read their own profile" on public.user_profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users insert their own profile" on public.user_profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update their own profile" on public.user_profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
grant select, insert, update on public.user_profiles to authenticated;

create or replace function public.create_user_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.user_profiles (user_id, username)
  values (new.id, nullif(lower(new.raw_user_meta_data ->> 'username'), ''))
  on conflict (user_id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile after insert on auth.users for each row execute procedure public.create_user_profile();

insert into public.user_profiles (user_id)
select id from auth.users
on conflict (user_id) do nothing;
