-- Create function to auto-create user profile on user signup
create or replace function public.create_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Insert a minimal profile; other fields can be filled later from the app
  insert into public.user_profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Idempotently create trigger on auth.users to call the function after signup
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