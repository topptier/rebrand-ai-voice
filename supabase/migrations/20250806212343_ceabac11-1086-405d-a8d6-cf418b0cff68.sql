-- Fix the search path issue for add_user_to_organization function
DROP FUNCTION IF EXISTS public.add_user_to_organization(UUID, TEXT, TEXT) CASCADE;

-- Recreate with proper search path
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