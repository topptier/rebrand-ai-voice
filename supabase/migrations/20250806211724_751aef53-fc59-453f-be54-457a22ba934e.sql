-- Drop duplicate functions and recreate with proper search path
DROP FUNCTION IF EXISTS public.get_user_organization_id();
DROP FUNCTION IF EXISTS public.get_user_role();
DROP FUNCTION IF EXISTS public.create_organization(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.add_user_to_organization(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_user_profile();

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

CREATE OR REPLACE FUNCTION public.add_user_to_organization(
    org_id UUID,
    user_email TEXT,
    user_role TEXT DEFAULT 'user'
)
RETURNS BOOLEAN AS $$
DECLARE
    existing_user_id UUID;
BEGIN
    SELECT id INTO existing_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF existing_user_id IS NOT NULL THEN
        INSERT INTO public.user_profiles (id, organization_id, email, role)
        VALUES (existing_user_id, org_id, user_email, user_role)
        ON CONFLICT (id) DO UPDATE 
        SET 
            organization_id = EXCLUDED.organization_id,
            role = EXCLUDED.role;
        
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
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