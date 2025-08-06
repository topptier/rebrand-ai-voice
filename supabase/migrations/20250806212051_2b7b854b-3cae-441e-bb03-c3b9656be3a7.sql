-- Fix RLS performance issue by optimizing auth function calls
-- Drop existing policies
DROP POLICY IF EXISTS "organizations_select" ON public.organizations;
DROP POLICY IF EXISTS "organizations_insert" ON public.organizations;
DROP POLICY IF EXISTS "organizations_update" ON public.organizations;
DROP POLICY IF EXISTS "organizations_delete" ON public.organizations;
DROP POLICY IF EXISTS "user_profiles_select" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete" ON public.user_profiles;

-- Recreate optimized policies with subqueries to prevent re-evaluation
-- Organizations policies
CREATE POLICY "organizations_select" ON public.organizations
  FOR SELECT USING (
    (SELECT public.get_user_role()) = 'super_admin' OR 
    id = (SELECT public.get_user_organization_id())
  );

CREATE POLICY "organizations_insert" ON public.organizations
  FOR INSERT WITH CHECK ((SELECT public.get_user_role()) = 'super_admin');

CREATE POLICY "organizations_update" ON public.organizations
  FOR UPDATE USING (
    (SELECT public.get_user_role()) = 'super_admin' OR 
    id = (SELECT public.get_user_organization_id())
  );

CREATE POLICY "organizations_delete" ON public.organizations
  FOR DELETE USING ((SELECT public.get_user_role()) = 'super_admin');

-- User profiles policies with optimized auth function calls
CREATE POLICY "user_profiles_select" ON public.user_profiles
  FOR SELECT USING (
    (SELECT public.get_user_role()) = 'super_admin' OR 
    organization_id = (SELECT public.get_user_organization_id())
  );

CREATE POLICY "user_profiles_insert" ON public.user_profiles
  FOR INSERT WITH CHECK (
    (SELECT public.get_user_role()) IN ('super_admin', 'org_admin') OR 
    id = (SELECT auth.uid())
  );

CREATE POLICY "user_profiles_update" ON public.user_profiles
  FOR UPDATE USING (
    (SELECT public.get_user_role()) IN ('super_admin', 'org_admin') OR 
    id = (SELECT auth.uid())
  );

CREATE POLICY "user_profiles_delete" ON public.user_profiles
  FOR DELETE USING (
    (SELECT public.get_user_role()) IN ('super_admin', 'org_admin')
  );