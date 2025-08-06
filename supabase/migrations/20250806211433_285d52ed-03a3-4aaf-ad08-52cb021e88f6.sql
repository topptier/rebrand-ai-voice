-- Insert sample organizations for testing
INSERT INTO public.organizations (name) VALUES 
  ('Acme Corporation'),
  ('TechStart Solutions'),
  ('Global Enterprises'),
  ('Demo Organization')
ON CONFLICT DO NOTHING;