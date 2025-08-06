-- Fix all remaining functions with search path issues
-- Drop and recreate all functions with proper search path
DROP FUNCTION IF EXISTS public.get_user_organization_id() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.create_organization(TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.add_user_to_organization(TEXT, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile() CASCADE;

-- Recreate all functions with proper search path
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION public.create_organization(
    org_name TEXT,
    org_industry TEXT DEFAULT NULL,
    org_domain TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_org_id UUID;
BEGIN
    INSERT INTO public.organizations (name)
    VALUES (org_name)
    RETURNING id INTO new_org_id;
    
    RETURN new_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id, 
        NEW.email, 
        NEW.raw_user_meta_data->>'full_name', 
        'user'
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Recreate RLS policies since they depend on the helper functions
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