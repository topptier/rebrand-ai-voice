-- ReceptAI Core - Sample Data for Testing
-- Populate database with realistic test data

-- =============================================
-- SAMPLE ORGANIZATIONS
-- =============================================

INSERT INTO organizations (id, name, domain, industry, phone, email, subscription_plan, subscription_status, settings) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Downtown Dental', 'downtowndental.com', 'healthcare', '+1-555-0123', 'admin@downtowndental.com', 'enterprise', 'active', '{"timezone": "America/New_York", "business_hours": {"monday": {"open": "08:00", "close": "17:00"}}}'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Legal Associates', 'legalassoc.com', 'legal', '+1-555-0124', 'contact@legalassoc.com', 'pro', 'active', '{"timezone": "America/Los_Angeles"}'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Wellness Clinic', 'wellnessclinic.org', 'healthcare', '+1-555-0125', 'info@wellnessclinic.org', 'starter', 'active', '{"timezone": "America/Chicago"}'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Med Center Plus', 'medcenterplus.com', 'healthcare', '+1-555-0126', 'admin@medcenterplus.com', 'pro', 'trial', '{"timezone": "America/Denver"}');

-- =============================================
-- SAMPLE APPOINTMENT TYPES
-- =============================================

INSERT INTO appointment_types (organization_id, name, description, duration_minutes, price_cents, buffer_time_minutes) VALUES
  -- Downtown Dental
  ('550e8400-e29b-41d4-a716-446655440001', 'General Cleaning', 'Routine dental cleaning and checkup', 60, 15000, 15),
  ('550e8400-e29b-41d4-a716-446655440001', 'Consultation', 'Initial consultation for new patients', 30, 8000, 10),
  ('550e8400-e29b-41d4-a716-446655440001', 'Root Canal', 'Root canal therapy treatment', 90, 120000, 30),
  
  -- Legal Associates  
  ('550e8400-e29b-41d4-a716-446655440002', 'Legal Consultation', 'Initial legal consultation', 60, 25000, 15),
  ('550e8400-e29b-41d4-a716-446655440002', 'Document Review', 'Contract and document review session', 45, 20000, 15),
  
  -- Wellness Clinic
  ('550e8400-e29b-41d4-a716-446655440003', 'Wellness Checkup', 'General wellness examination', 45, 12000, 15),
  ('550e8400-e29b-41d4-a716-446655440003', 'Nutrition Consultation', 'Nutritional counseling session', 30, 8000, 10),
  
  -- Med Center Plus
  ('550e8400-e29b-41d4-a716-446655440004', 'Primary Care Visit', 'General medical examination', 30, 15000, 15),
  ('550e8400-e29b-41d4-a716-446655440004', 'Specialist Referral', 'Specialist consultation appointment', 45, 20000, 15);

-- =============================================
-- SAMPLE AVAILABILITY WINDOWS
-- =============================================

INSERT INTO availability_windows (organization_id, day_of_week, start_time, end_time, timezone) VALUES
  -- Downtown Dental (Mon-Fri 8AM-5PM EST)
  ('550e8400-e29b-41d4-a716-446655440001', 1, '08:00:00', '17:00:00', 'America/New_York'),
  ('550e8400-e29b-41d4-a716-446655440001', 2, '08:00:00', '17:00:00', 'America/New_York'),
  ('550e8400-e29b-41d4-a716-446655440001', 3, '08:00:00', '17:00:00', 'America/New_York'),
  ('550e8400-e29b-41d4-a716-446655440001', 4, '08:00:00', '17:00:00', 'America/New_York'),
  ('550e8400-e29b-41d4-a716-446655440001', 5, '08:00:00', '17:00:00', 'America/New_York'),
  
  -- Legal Associates (Mon-Fri 9AM-6PM PST)
  ('550e8400-e29b-41d4-a716-446655440002', 1, '09:00:00', '18:00:00', 'America/Los_Angeles'),
  ('550e8400-e29b-41d4-a716-446655440002', 2, '09:00:00', '18:00:00', 'America/Los_Angeles'),
  ('550e8400-e29b-41d4-a716-446655440002', 3, '09:00:00', '18:00:00', 'America/Los_Angeles'),
  ('550e8400-e29b-41d4-a716-446655440002', 4, '09:00:00', '18:00:00', 'America/Los_Angeles'),
  ('550e8400-e29b-41d4-a716-446655440002', 5, '09:00:00', '18:00:00', 'America/Los_Angeles');

-- =============================================
-- SAMPLE CALLS
-- =============================================

INSERT INTO calls (organization_id, caller_phone, caller_name, direction, status, call_type, start_time, end_time, duration_seconds, ai_confidence_score, outcome) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '+1-555-0201', 'Sarah Johnson', 'inbound', 'completed', 'appointment', NOW() - INTERVAL '2 minutes', NOW() - INTERVAL '2 minutes' + INTERVAL '222 seconds', 222, 0.94, 'appointment_booked'),
  ('550e8400-e29b-41d4-a716-446655440002', '+1-555-0202', 'Michael Chen', 'inbound', 'completed', 'inquiry', NOW() - INTERVAL '5 minutes', NOW() - INTERVAL '5 minutes' + INTERVAL '138 seconds', 138, 0.89, 'information_provided'),
  ('550e8400-e29b-41d4-a716-446655440003', '+1-555-0203', 'Emma Davis', 'outbound', 'completed', 'appointment', NOW() - INTERVAL '12 minutes', NOW() - INTERVAL '12 minutes' + INTERVAL '105 seconds', 105, 0.96, 'appointment_booked'),
  ('550e8400-e29b-41d4-a716-446655440001', '+1-555-0204', 'Robert Smith', 'inbound', 'completed', 'support', NOW() - INTERVAL '18 minutes', NOW() - INTERVAL '18 minutes' + INTERVAL '262 seconds', 262, 0.76, 'escalated'),
  ('550e8400-e29b-41d4-a716-446655440004', '+1-555-0205', 'Lisa Wang', 'inbound', 'completed', 'appointment', NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '25 minutes' + INTERVAL '375 seconds', 375, 0.92, 'payment_collected');

-- =============================================
-- SAMPLE APPOINTMENTS
-- =============================================

INSERT INTO appointments (organization_id, customer_name, customer_phone, customer_email, appointment_type_id, scheduled_at, duration_minutes, status, deposit_required_cents, deposit_paid_cents) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', '+1-555-0201', 'sarah.johnson@email.com', 
   (SELECT id FROM appointment_types WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001' AND name = 'General Cleaning' LIMIT 1),
   NOW() + INTERVAL '2 days', 60, 'scheduled', 5000, 5000),
  
  ('550e8400-e29b-41d4-a716-446655440003', 'Emma Davis', '+1-555-0203', 'emma.davis@email.com',
   (SELECT id FROM appointment_types WHERE organization_id = '550e8400-e29b-41d4-a716-446655440003' AND name = 'Wellness Checkup' LIMIT 1),
   NOW() + INTERVAL '1 day', 45, 'confirmed', 0, 0),
   
  ('550e8400-e29b-41d4-a716-446655440004', 'Lisa Wang', '+1-555-0205', 'lisa.wang@email.com',
   (SELECT id FROM appointment_types WHERE organization_id = '550e8400-e29b-41d4-a716-446655440004' AND name = 'Primary Care Visit' LIMIT 1),
   NOW() + INTERVAL '3 days', 30, 'scheduled', 2500, 2500);

-- =============================================
-- SAMPLE PAYMENTS
-- =============================================

INSERT INTO payments (organization_id, amount_cents, currency, status, payment_type) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 5000, 'usd', 'succeeded', 'deposit'),
  ('550e8400-e29b-41d4-a716-446655440004', 2500, 'usd', 'succeeded', 'deposit'),
  ('550e8400-e29b-41d4-a716-446655440002', 49900, 'usd', 'succeeded', 'subscription'),
  ('550e8400-e29b-41d4-a716-446655440001', 149900, 'usd', 'succeeded', 'subscription');

-- =============================================
-- SAMPLE ORGANIZATION BRANDING
-- =============================================

INSERT INTO organization_branding (organization_id, primary_color, secondary_color, greeting_script, business_hours) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '#2563EB', '#1D4ED8', 
   'Hello! You''ve reached Downtown Dental. I''m your AI assistant. How can I help you today?',
   '{"monday": {"open": "08:00", "close": "17:00"}, "tuesday": {"open": "08:00", "close": "17:00"}}'),
   
  ('550e8400-e29b-41d4-a716-446655440002', '#DC2626', '#B91C1C',
   'Thank you for calling Legal Associates. I''m here to assist you with your legal needs. How may I help?',
   '{"monday": {"open": "09:00", "close": "18:00"}, "tuesday": {"open": "09:00", "close": "18:00"}}'),
   
  ('550e8400-e29b-41d4-a716-446655440003', '#059669', '#047857',
   'Welcome to Wellness Clinic! I''m your virtual assistant. How can I support your wellness journey today?',
   '{"monday": {"open": "07:00", "close": "19:00"}, "tuesday": {"open": "07:00", "close": "19:00"}}');

-- =============================================
-- SAMPLE AI SCRIPTS
-- =============================================

INSERT INTO ai_scripts (organization_id, script_type, script_content, variables) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'greeting', 
   'Hello! Thank you for calling {{organization_name}}. I''m your AI dental assistant. How can I help you today?',
   '{"organization_name": "Downtown Dental"}'),
   
  ('550e8400-e29b-41d4-a716-446655440001', 'appointment_booking',
   'I''d be happy to schedule your {{appointment_type}} appointment. What date and time works best for you?',
   '{"appointment_type": "cleaning"}'),
   
  ('550e8400-e29b-41d4-a716-446655440002', 'greeting',
   'Good {{time_of_day}}! You''ve reached {{organization_name}}. I''m your AI legal assistant. How may I assist you with your legal needs today?',
   '{"organization_name": "Legal Associates", "time_of_day": "morning"}');

-- =============================================
-- SAMPLE DAILY ANALYTICS
-- =============================================

INSERT INTO daily_analytics (organization_id, date, total_calls, answered_calls, appointments_booked, payments_collected_cents, ai_accuracy_score, avg_call_duration_seconds, escalation_rate) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '1 day', 24, 22, 8, 324500, 0.94, 180, 0.08),
  ('550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '2 days', 18, 16, 6, 218000, 0.92, 165, 0.11),
  ('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '1 day', 15, 14, 4, 156000, 0.89, 195, 0.14),
  ('550e8400-e29b-41d4-a716-446655440003', CURRENT_DATE - INTERVAL '1 day', 12, 11, 5, 109800, 0.96, 145, 0.05);

-- =============================================
-- SAMPLE INTEGRATIONS
-- =============================================

INSERT INTO integrations (organization_id, integration_type, config, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'twilio', '{"account_sid": "ACxxx", "phone_number": "+15550123"}', true),
  ('550e8400-e29b-41d4-a716-446655440001', 'stripe', '{"publishable_key": "pk_test_xxx"}', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'twilio', '{"account_sid": "ACyyy", "phone_number": "+15550124"}', true),
  ('550e8400-e29b-41d4-a716-446655440003', 'cal_com', '{"api_key": "cal_xxx", "event_type_id": "123"}', true);