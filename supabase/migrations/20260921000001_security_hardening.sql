-- Supabase Security Remediation
-- 1. Create a private schema for internal authorization functions
CREATE SCHEMA IF NOT EXISTS private;

-- Prevent public access to the private schema
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

-- 2. Create the real Admin authorization table in public schema
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on admin_users, but provide NO public policies (it is strictly managed by server/database roles)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Populate existing legitimate Admin
INSERT INTO public.admin_users (user_id)
SELECT id FROM auth.users WHERE email = 'aayansayyad168@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- 4. Create the least-exposed Admin check function in the private schema
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  );
END;
$$;

-- Grant EXECUTE to authenticated so RLS policies can evaluate it, but PostgREST won't expose it since it's in `private` schema
REVOKE EXECUTE ON FUNCTION private.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated, service_role;

-- 5. Function Hardening and RPC Lockdown for Rate Limiters
DO $$
BEGIN
  -- Fix public.atomic_record_login_failure
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'atomic_record_login_failure') THEN
    ALTER FUNCTION public.atomic_record_login_failure(text, integer) SET search_path = '';
    REVOKE EXECUTE ON FUNCTION public.atomic_record_login_failure(text, integer) FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.atomic_record_login_failure(text, integer) TO service_role;
  END IF;

  -- Fix public.atomic_reset_login_failures
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'atomic_reset_login_failures') THEN
    ALTER FUNCTION public.atomic_reset_login_failures(text) SET search_path = '';
    REVOKE EXECUTE ON FUNCTION public.atomic_reset_login_failures(text) FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.atomic_reset_login_failures(text) TO service_role;
  END IF;

  -- Fix public.check_login_rate_limit
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_login_rate_limit') THEN
    ALTER FUNCTION public.check_login_rate_limit(text) SET search_path = '';
    REVOKE EXECUTE ON FUNCTION public.check_login_rate_limit(text) FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.check_login_rate_limit(text) TO service_role;
  END IF;

  -- Fix public.handle_updated_at
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
    ALTER FUNCTION public.handle_updated_at() SET search_path = '';
  END IF;

  -- Fix public.rls_auto_enable (revoke entirely if exists, harden if it does)
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'rls_auto_enable') THEN
    ALTER FUNCTION public.rls_auto_enable() SET search_path = '';
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated, service_role;
  END IF;
END $$;


-- 6. RLS Policy Replacements
-- First, drop existing policies that grant write access based on broad authentication
DO $$
DECLARE
  t text;
  p text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN (
    'blog_posts', 'certifications', 'contact_messages', 'future_projects', 
    'portfolio_configs', 'projects', 'roadmap_items', 'services', 'skills', 'social_links'
  ) LOOP
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p, t);
    END LOOP;
  END LOOP;
END $$;

-- Table: blog_posts
CREATE POLICY "Public can select published blog posts" ON public.blog_posts FOR SELECT TO public USING (status = 'published');
CREATE POLICY "Admin can select all blog posts" ON public.blog_posts FOR SELECT TO authenticated USING (private.is_admin());
CREATE POLICY "Admin can insert blog posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (private.is_admin());
CREATE POLICY "Admin can update blog posts" ON public.blog_posts FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "Admin can delete blog posts" ON public.blog_posts FOR DELETE TO authenticated USING (private.is_admin());

-- Table: certifications
CREATE POLICY "Public can select certifications" ON public.certifications FOR SELECT TO public USING (true);
CREATE POLICY "Admin can insert certifications" ON public.certifications FOR INSERT TO authenticated WITH CHECK (private.is_admin());
CREATE POLICY "Admin can update certifications" ON public.certifications FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "Admin can delete certifications" ON public.certifications FOR DELETE TO authenticated USING (private.is_admin());

-- Table: future_projects
CREATE POLICY "Public can select future_projects" ON public.future_projects FOR SELECT TO public USING (true);
CREATE POLICY "Admin can insert future_projects" ON public.future_projects FOR INSERT TO authenticated WITH CHECK (private.is_admin());
CREATE POLICY "Admin can update future_projects" ON public.future_projects FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "Admin can delete future_projects" ON public.future_projects FOR DELETE TO authenticated USING (private.is_admin());

-- Table: portfolio_configs
CREATE POLICY "Public can select portfolio_configs" ON public.portfolio_configs FOR SELECT TO public USING (true);
CREATE POLICY "Admin can insert portfolio_configs" ON public.portfolio_configs FOR INSERT TO authenticated WITH CHECK (private.is_admin());
CREATE POLICY "Admin can update portfolio_configs" ON public.portfolio_configs FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "Admin can delete portfolio_configs" ON public.portfolio_configs FOR DELETE TO authenticated USING (private.is_admin());

-- Table: projects
CREATE POLICY "Public can select projects" ON public.projects FOR SELECT TO public USING (true);
CREATE POLICY "Admin can insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (private.is_admin());
CREATE POLICY "Admin can update projects" ON public.projects FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "Admin can delete projects" ON public.projects FOR DELETE TO authenticated USING (private.is_admin());

-- Table: roadmap_items
CREATE POLICY "Public can select roadmap_items" ON public.roadmap_items FOR SELECT TO public USING (true);
CREATE POLICY "Admin can insert roadmap_items" ON public.roadmap_items FOR INSERT TO authenticated WITH CHECK (private.is_admin());
CREATE POLICY "Admin can update roadmap_items" ON public.roadmap_items FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "Admin can delete roadmap_items" ON public.roadmap_items FOR DELETE TO authenticated USING (private.is_admin());

-- Table: services
CREATE POLICY "Public can select services" ON public.services FOR SELECT TO public USING (true);
CREATE POLICY "Admin can insert services" ON public.services FOR INSERT TO authenticated WITH CHECK (private.is_admin());
CREATE POLICY "Admin can update services" ON public.services FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "Admin can delete services" ON public.services FOR DELETE TO authenticated USING (private.is_admin());

-- Table: skills
CREATE POLICY "Public can select skills" ON public.skills FOR SELECT TO public USING (true);
CREATE POLICY "Admin can insert skills" ON public.skills FOR INSERT TO authenticated WITH CHECK (private.is_admin());
CREATE POLICY "Admin can update skills" ON public.skills FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "Admin can delete skills" ON public.skills FOR DELETE TO authenticated USING (private.is_admin());

-- Table: social_links
CREATE POLICY "Public can select social_links" ON public.social_links FOR SELECT TO public USING (true);
CREATE POLICY "Admin can insert social_links" ON public.social_links FOR INSERT TO authenticated WITH CHECK (private.is_admin());
CREATE POLICY "Admin can update social_links" ON public.social_links FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "Admin can delete social_links" ON public.social_links FOR DELETE TO authenticated USING (private.is_admin());

-- 7. Contact Messages
-- Add strict constraints to prevent abuse
ALTER TABLE public.contact_messages 
  ADD CONSTRAINT name_length_check CHECK (length(COALESCE(name, '')) < 100) NOT VALID,
  ADD CONSTRAINT email_length_check CHECK (length(COALESCE(email, '')) < 255) NOT VALID,
  ADD CONSTRAINT message_length_check CHECK (length(COALESCE(message, '')) < 5000) NOT VALID;

-- Policies
CREATE POLICY "Public can insert contact messages" ON public.contact_messages FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admin can select contact messages" ON public.contact_messages FOR SELECT TO authenticated USING (private.is_admin());
CREATE POLICY "Admin can update contact messages" ON public.contact_messages FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "Admin can delete contact messages" ON public.contact_messages FOR DELETE TO authenticated USING (private.is_admin());


-- 8. Storage Policy Cleanup
-- Remove any permissive SELECT policy from storage.objects that allows public listing
DO $$
DECLARE
  p text;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND (roles = '{PUBLIC}' OR roles = '{anon}' OR roles = '{public}') AND cmd = 'SELECT' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', p);
  END LOOP;
END $$;
