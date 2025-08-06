-- ReceptAI Core - Complete Database Schema
-- Multi-tenant AI Receptionist SaaS Platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- CORE TENANT MANAGEMENT
-- =============================================

-- Organizations (Clients: Clinics, Law Firms, etc.)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  industry TEXT NOT NULL CHECK (industry IN ('healthcare', 'legal', 'professional_services', 'other')),
  phone TEXT,
  email TEXT,
  address TEXT,
  subscription_plan TEXT NOT NULL DEFAULT 'starter' CHECK (subscription_plan IN ('starter', 'pro', 'enterprise')),
  subscription_status TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'suspended', 'cancelled')),
  subscription_end_date TIMESTAMPTZ,
  stripe_customer_id TEXT UNIQUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Management with Multi-Tenant Support
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('super_admin', 'org_admin', 'agent', 'user')),
  phone TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  last_seen_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

-- =============================================
-- CALL MANAGEMENT SYSTEM
-- =============================================

-- Call Sessions
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  twilio_call_sid TEXT UNIQUE,
  caller_phone TEXT NOT NULL,
  caller_name TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'ringing', 'answered', 'completed', 'failed', 'busy', 'no_answer')),
  call_type TEXT CHECK (call_type IN ('appointment', 'inquiry', 'emergency', 'support', 'other')),
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER,
  recording_url TEXT,
  transcript TEXT,
  ai_confidence_score DECIMAL(3,2) CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 1),
  escalated_to_human BOOLEAN DEFAULT FALSE,
  escalation_reason TEXT,
  outcome TEXT CHECK (outcome IN ('appointment_booked', 'information_provided', 'payment_collected', 'escalated', 'voicemail', 'hang_up')),
  cost_cents INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Call Conversation Log
CREATE TABLE call_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  speaker TEXT NOT NULL CHECK (speaker IN ('ai', 'caller', 'human_agent')),
  message TEXT NOT NULL,
  timestamp_offset INTEGER NOT NULL, -- Seconds from call start
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  intent TEXT,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- APPOINTMENT MANAGEMENT
-- =============================================

-- Appointment Types/Services
CREATE TABLE appointment_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price_cents INTEGER DEFAULT 0,
  buffer_time_minutes INTEGER DEFAULT 15,
  cal_com_event_type_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  call_id UUID REFERENCES calls(id),
  appointment_type_id UUID NOT NULL REFERENCES appointment_types(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show')),
  cal_com_booking_id TEXT UNIQUE,
  notes TEXT,
  reminder_sent_at TIMESTAMPTZ[],
  deposit_required_cents INTEGER DEFAULT 0,
  deposit_paid_cents INTEGER DEFAULT 0,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Availability Windows
CREATE TABLE availability_windows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- PAYMENT MANAGEMENT
-- =============================================

-- Payment Transactions
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id),
  call_id UUID REFERENCES calls(id),
  stripe_payment_intent_id TEXT UNIQUE,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled', 'refunded')),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('deposit', 'full_payment', 'subscription')),
  stripe_fee_cents INTEGER DEFAULT 0,
  refund_amount_cents INTEGER DEFAULT 0,
  refund_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- WHITE-LABEL CONFIGURATION
-- =============================================

-- Organization Branding
CREATE TABLE organization_branding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#10B981',
  secondary_color TEXT DEFAULT '#059669',
  accent_color TEXT DEFAULT '#34D399',
  custom_domain TEXT UNIQUE,
  business_hours JSONB DEFAULT '{}',
  ai_voice_settings JSONB DEFAULT '{}', -- Voice ID, speed, pitch, etc.
  greeting_script TEXT,
  hold_music_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Custom AI Scripts per Organization
CREATE TABLE ai_scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  script_type TEXT NOT NULL CHECK (script_type IN ('greeting', 'appointment_booking', 'payment_collection', 'escalation', 'closing')),
  script_content TEXT NOT NULL,
  variables JSONB DEFAULT '{}', -- Template variables
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, script_type)
);

-- =============================================
-- ANALYTICS & REPORTING
-- =============================================

-- Daily Analytics Summary
CREATE TABLE daily_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_calls INTEGER DEFAULT 0,
  answered_calls INTEGER DEFAULT 0,
  appointments_booked INTEGER DEFAULT 0,
  payments_collected_cents INTEGER DEFAULT 0,
  ai_accuracy_score DECIMAL(3,2),
  avg_call_duration_seconds INTEGER DEFAULT 0,
  escalation_rate DECIMAL(5,4) DEFAULT 0,
  customer_satisfaction_score DECIMAL(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, date)
);

-- =============================================
-- SYSTEM CONFIGURATION
-- =============================================

-- API Keys and Integrations
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('twilio', 'cal_com', 'stripe', 'crm', 'email')),
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, integration_type)
);

-- =============================================
-- AUDIT LOGGING
-- =============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL,
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- AI FEEDBACK
-- =============================================
CREATE TABLE ai_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  correct_intent TEXT,
  correct_response TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- WEBHOOK LOGGING
-- =============================================
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FUNCTIONS FOR AUTOMATION
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to all tables with updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calls_updated_at BEFORE UPDATE ON calls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointment_types_updated_at BEFORE UPDATE ON appointment_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organization_branding_updated_at BEFORE UPDATE ON organization_branding FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_scripts_updated_at BEFORE UPDATE ON ai_scripts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  phone TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

-- =============================================
-- CALL MANAGEMENT SYSTEM
-- =============================================

-- Call Sessions
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  twilio_call_sid TEXT UNIQUE,
  caller_phone TEXT NOT NULL,
  caller_name TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'ringing', 'answered', 'completed', 'failed', 'busy', 'no_answer')),
  call_type TEXT CHECK (call_type IN ('appointment', 'inquiry', 'emergency', 'support', 'other')),
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER,
  recording_url TEXT,
  transcript TEXT,
  ai_confidence_score DECIMAL(3,2) CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 1),
  escalated_to_human BOOLEAN DEFAULT FALSE,
  escalation_reason TEXT,
  outcome TEXT CHECK (outcome IN ('appointment_booked', 'information_provided', 'payment_collected', 'escalated', 'voicemail', 'hang_up')),
  cost_cents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Call Conversation Log
CREATE TABLE call_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  speaker TEXT NOT NULL CHECK (speaker IN ('ai', 'caller', 'human_agent')),
  message TEXT NOT NULL,
  timestamp_offset INTEGER NOT NULL, -- Seconds from call start
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  intent TEXT,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- APPOINTMENT MANAGEMENT
-- =============================================

-- Appointment Types/Services
CREATE TABLE appointment_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price_cents INTEGER DEFAULT 0,
  buffer_time_minutes INTEGER DEFAULT 15,
  cal_com_event_type_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  call_id UUID REFERENCES calls(id),
  appointment_type_id UUID NOT NULL REFERENCES appointment_types(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show')),
  cal_com_booking_id TEXT UNIQUE,
  notes TEXT,
  reminder_sent_at TIMESTAMPTZ[],
  deposit_required_cents INTEGER DEFAULT 0,
  deposit_paid_cents INTEGER DEFAULT 0,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Availability Windows
CREATE TABLE availability_windows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- PAYMENT MANAGEMENT
-- =============================================

-- Payment Transactions
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id),
  call_id UUID REFERENCES calls(id),
  stripe_payment_intent_id TEXT UNIQUE,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled', 'refunded')),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('deposit', 'full_payment', 'subscription')),
  stripe_fee_cents INTEGER DEFAULT 0,
  refund_amount_cents INTEGER DEFAULT 0,
  refund_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- WHITE-LABEL CONFIGURATION
-- =============================================

-- Organization Branding
CREATE TABLE organization_branding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#10B981',
  secondary_color TEXT DEFAULT '#059669',
  accent_color TEXT DEFAULT '#34D399',
  custom_domain TEXT UNIQUE,
  business_hours JSONB DEFAULT '{}',
  ai_voice_settings JSONB DEFAULT '{}', -- Voice ID, speed, pitch, etc.
  greeting_script TEXT,
  hold_music_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Custom AI Scripts per Organization
CREATE TABLE ai_scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  script_type TEXT NOT NULL CHECK (script_type IN ('greeting', 'appointment_booking', 'payment_collection', 'escalation', 'closing')),
  script_content TEXT NOT NULL,
  variables JSONB DEFAULT '{}', -- Template variables
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, script_type)
);

-- =============================================
-- ANALYTICS & REPORTING
-- =============================================

-- Daily Analytics Summary
CREATE TABLE daily_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_calls INTEGER DEFAULT 0,
  answered_calls INTEGER DEFAULT 0,
  appointments_booked INTEGER DEFAULT 0,
  payments_collected_cents INTEGER DEFAULT 0,
  ai_accuracy_score DECIMAL(3,2),
  avg_call_duration_seconds INTEGER DEFAULT 0,
  escalation_rate DECIMAL(5,4) DEFAULT 0, -- Percentage as decimal
  customer_satisfaction_score DECIMAL(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, date)
);

-- =============================================
-- SYSTEM CONFIGURATION
-- =============================================

-- API Keys and Integrations
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('twilio', 'cal_com', 'stripe', 'crm', 'email')),
  config JSONB NOT NULL DEFAULT '{}', -- Encrypted configuration
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, integration_type)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Organizations
CREATE INDEX idx_organizations_subscription_status ON organizations(subscription_status);
CREATE INDEX idx_organizations_industry ON organizations(industry);

-- User Profiles
CREATE INDEX idx_user_profiles_organization_id ON user_profiles(organization_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- Calls
CREATE INDEX idx_calls_organization_id ON calls(organization_id);
CREATE INDEX idx_calls_start_time ON calls(start_time);
CREATE INDEX idx_calls_status ON calls(status);
CREATE INDEX idx_calls_caller_phone ON calls(caller_phone);

-- Call Messages
CREATE INDEX idx_call_messages_call_id ON call_messages(call_id);

-- Appointments
CREATE INDEX idx_appointments_organization_id ON appointments(organization_id);
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_customer_phone ON appointments(customer_phone);

-- Payments
CREATE INDEX idx_payments_organization_id ON payments(organization_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- Analytics
CREATE INDEX idx_daily_analytics_organization_date ON daily_analytics(organization_id, date);

-- =============================================
-- FUNCTIONS FOR AUTOMATION
-- =============================================

-- Update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to all tables with updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calls_updated_at BEFORE UPDATE ON calls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointment_types_updated_at BEFORE UPDATE ON appointment_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organization_branding_updated_at BEFORE UPDATE ON organization_branding FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_scripts_updated_at BEFORE UPDATE ON ai_scripts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
