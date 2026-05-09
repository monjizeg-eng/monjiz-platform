-- Enhanced admin policies for comprehensive freelancer management

-- Ensure admin can delete freelancers
DROP POLICY IF EXISTS "Admins can delete freelancers" ON public.freelancers;

CREATE POLICY "Admins can delete freelancers"
  ON public.freelancers FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Ensure projects are properly controlled by admins
DROP POLICY IF EXISTS "Admins can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can manage all projects" ON public.projects;

CREATE POLICY "Admins can view all projects"
  ON public.projects FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all projects"
  ON public.projects FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add banned status capability
ALTER TABLE public.freelancers
  ADD CONSTRAINT check_status CHECK (status IN ('pending', 'active', 'banned'))
  NOT VALID;

-- Admin access on client_requests
DROP POLICY IF EXISTS "Admins can view all client_requests" ON public.client_requests;

CREATE POLICY "Admins can view all client_requests"
  ON public.client_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Policies for user_roles table (already exist, but ensuring they're complete)
DROP POLICY IF EXISTS "Admins can create roles for users" ON public.user_roles;

CREATE POLICY "Admins can create roles for users"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));
