
-- Expand freelancers
ALTER TABLE public.freelancers
  ADD COLUMN IF NOT EXISTS profile_image text,
  ADD COLUMN IF NOT EXISTS portfolio_images text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS linkedin text,
  ADD COLUMN IF NOT EXISTS behance text,
  ADD COLUMN IF NOT EXISTS github text;

-- New client_requests table
CREATE TABLE IF NOT EXISTS public.client_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id uuid NOT NULL REFERENCES public.freelancers(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  client_contact text NOT NULL,
  project_type text NOT NULL,
  budget text NOT NULL,
  deadline text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.client_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit client request"
  ON public.client_requests FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Freelancer can view own client requests"
  ON public.client_requests FOR SELECT TO public
  USING (freelancer_id IN (SELECT id FROM public.freelancers WHERE user_id = auth.uid()));

-- Storage bucket for freelancer media
INSERT INTO storage.buckets (id, name, public)
VALUES ('freelancer-media', 'freelancer-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Freelancer media public read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'freelancer-media');

CREATE POLICY "Freelancer can upload own media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'freelancer-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Freelancer can update own media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'freelancer-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Freelancer can delete own media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'freelancer-media' AND auth.uid()::text = (storage.foldername(name))[1]);
