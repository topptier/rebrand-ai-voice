-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS policies
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Organizations policies
CREATE POLICY "organizations_select" ON public.organizations
  FOR SELECT USING (
    public.get_user_role() = 'super_admin' OR 
    id = public.get_user_organization_id()
  );

CREATE POLICY "organizations_insert" ON public.organizations
  FOR INSERT WITH CHECK (public.get_user_role() = 'super_admin');

CREATE POLICY "organizations_update" ON public.organizations
  FOR UPDATE USING (
    public.get_user_role() = 'super_admin' OR 
    id = public.get_user_organization_id()
  );

CREATE POLICY "organizations_delete" ON public.organizations
  FOR DELETE USING (public.get_user_role() = 'super_admin');

-- User profiles policies
CREATE POLICY "user_profiles_select" ON public.user_profiles
  FOR SELECT USING (
    public.get_user_role() = 'super_admin' OR 
    organization_id = public.get_user_organization_id()
  );

CREATE POLICY "user_profiles_insert" ON public.user_profiles
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('super_admin', 'org_admin') OR 
    id = auth.uid()
  );

CREATE POLICY "user_profiles_update" ON public.user_profiles
  FOR UPDATE USING (
    public.get_user_role() IN ('super_admin', 'org_admin') OR 
    id = auth.uid()
  );

CREATE POLICY "user_profiles_delete" ON public.user_profiles
  FOR DELETE USING (
    public.get_user_role() IN ('super_admin', 'org_admin')
  );