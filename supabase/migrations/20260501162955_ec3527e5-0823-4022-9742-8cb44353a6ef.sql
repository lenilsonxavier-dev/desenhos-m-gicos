CREATE TABLE public.usage_counter (
  day DATE NOT NULL PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.usage_counter ENABLE ROW LEVEL SECURITY;

-- Nobody can access from client; only service role (used in edge functions) bypasses RLS.
CREATE POLICY "no_client_access" ON public.usage_counter FOR SELECT USING (false);