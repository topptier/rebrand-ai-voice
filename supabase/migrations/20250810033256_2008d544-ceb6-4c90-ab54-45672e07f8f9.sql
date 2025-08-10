-- Ensure user profiles are auto-created on signup (critical for AuthGuard)
-- Idempotent creation of trigger that calls existing public.create_user_profile()
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_user_profile();
  END IF;
END;
$$;