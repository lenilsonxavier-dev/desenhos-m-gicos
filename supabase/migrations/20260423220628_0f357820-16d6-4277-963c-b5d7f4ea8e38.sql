drop policy "drawings_storage_select" on storage.objects;

create policy "drawings_storage_select_own" on storage.objects for select
using (bucket_id = 'drawings' and auth.uid()::text = (storage.foldername(name))[1]);