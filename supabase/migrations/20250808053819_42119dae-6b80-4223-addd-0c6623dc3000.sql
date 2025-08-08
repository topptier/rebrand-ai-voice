-- Fix RLS so users can read their own profile even without an organization
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop the overly restrictive select policy if it exists
DROP POLICY IF EXISTS user_profiles_select ON public.user_profiles;

-- Recreate select policies
-- 1) Users can always read their own profile
CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
USING (id = auth.uid());

-- 2) Preserve admin/org-based access from previous policy
CREATE POLICY "Admins and org members can view by organization"
ON public.user_profiles
FOR SELECT
USING (
  (SELECT public.get_user_role()) IN ('super_admin','org_admin')
  OR organization_id = (SELECT public.get_user_organization_id())
);

-- Ensure insert/update/delete policies remain unchanged
-- (No changes made here)
