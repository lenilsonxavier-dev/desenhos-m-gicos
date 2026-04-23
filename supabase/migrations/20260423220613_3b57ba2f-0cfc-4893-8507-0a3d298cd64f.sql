-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Drawings (gallery)
create table public.drawings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Meu desenho',
  image_path text not null,
  created_at timestamptz not null default now()
);
alter table public.drawings enable row level security;

create policy "drawings_select_own" on public.drawings for select using (auth.uid() = user_id);
create policy "drawings_insert_own" on public.drawings for insert with check (auth.uid() = user_id);
create policy "drawings_update_own" on public.drawings for update using (auth.uid() = user_id);
create policy "drawings_delete_own" on public.drawings for delete using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Storage bucket for colored drawings
insert into storage.buckets (id, name, public) values ('drawings', 'drawings', true);

create policy "drawings_storage_select" on storage.objects for select
using (bucket_id = 'drawings');

create policy "drawings_storage_insert" on storage.objects for insert
with check (bucket_id = 'drawings' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "drawings_storage_update" on storage.objects for update
using (bucket_id = 'drawings' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "drawings_storage_delete" on storage.objects for delete
using (bucket_id = 'drawings' and auth.uid()::text = (storage.foldername(name))[1]);