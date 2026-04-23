-- Make bucket private; we'll use signed URLs in app
update storage.buckets set public = false where id = 'drawings';