-- Fix search path for all functions to meet security requirements
CREATE OR REPLACE FUNCTION public.create_organization(
    org_name TEXT,
    org_industry TEXT DEFAULT NULL,
    org_domain TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_org_id UUID;
BEGIN
    -- Insert new organization and return its ID
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
    -- Find the user ID based on email
    SELECT id INTO existing_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    -- If user exists, create or update their profile
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
    -- Insert a new profile for the user
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id, 
        NEW.email, 
        NEW.raw_user_meta_data->>'full_name', 
        'user'  -- Default role
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';