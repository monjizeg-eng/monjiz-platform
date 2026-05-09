-- Projects table for freelancer portfolio
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id UUID NOT NULL REFERENCES public.freelancers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policies for projects
CREATE POLICY "Public can view projects of active freelancers"
  ON public.projects FOR SELECT
  USING (freelancer_id IN (SELECT id FROM public.freelancers WHERE status = 'active'));

CREATE POLICY "Freelancer can view own projects"
  ON public.projects FOR SELECT
  USING (freelancer_id IN (SELECT id FROM public.freelancers WHERE user_id = auth.uid()));

CREATE POLICY "Freelancer can insert own projects"
  ON public.projects FOR INSERT
  WITH CHECK (freelancer_id IN (SELECT id FROM public.freelancers WHERE user_id = auth.uid()));

CREATE POLICY "Freelancer can update own projects"
  ON public.projects FOR UPDATE
  USING (freelancer_id IN (SELECT id FROM public.freelancers WHERE user_id = auth.uid()));

CREATE POLICY "Freelancer can delete own projects"
  ON public.projects FOR DELETE
  USING (freelancer_id IN (SELECT id FROM public.freelancers WHERE user_id = auth.uid()));

-- Admin policies
CREATE POLICY "Admins can view all projects"
  ON public.projects FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all projects"
  ON public.projects FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER projects_set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
