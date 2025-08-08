-- First, create the missing user profile for the current user
INSERT INTO public.user_profiles (id, organization_id, role, created_at)
VALUES ('3c78ae91-c2a1-49c1-ba0a-38c0ddee81c0', NULL, 'user', now())
ON CONFLICT (id) DO NOTHING;

-- Check if the trigger exists and is working
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger function with better error handling
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, organization_id, role, created_at)
    VALUES (
        NEW.id, 
        NULL,  -- No organization required
        'user', 
        now()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't block the signup
    RAISE LOG 'Error creating user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();