
-- Freelancers table
CREATE TABLE public.freelancers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  specialty TEXT NOT NULL,
  portfolio TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.freelancers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active freelancers"
  ON public.freelancers FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Freelancers insert own profile"
  ON public.freelancers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Freelancers update own profile"
  ON public.freelancers FOR UPDATE
  USING (auth.uid() = user_id);

-- Project requests
CREATE TABLE public.project_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id UUID NOT NULL REFERENCES public.freelancers(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_contact TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a request"
  ON public.project_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Freelancer can view own requests"
  ON public.project_requests FOR SELECT
  USING (
    freelancer_id IN (SELECT id FROM public.freelancers WHERE user_id = auth.uid())
  );

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER freelancers_set_updated_at
  BEFORE UPDATE ON public.freelancers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
