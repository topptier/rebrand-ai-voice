-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = '';