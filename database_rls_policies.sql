-- ReceptAI Core - Row Level Security (RLS) Policies
-- Enterprise-grade multi-tenant security

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTION FOR USER ORGANIZATION
-- =============================================

CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT organization_id 
    FROM user_profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM user_profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- ORGANIZATIONS TABLE POLICIES
-- =============================================

-- Super admins can see all organizations
-- Org admins can see their own organization
-- Regular users can see their own organization
CREATE POLICY "organizations_select" ON organizations
  FOR SELECT
  USING (
    get_user_role() = 'super_admin' OR
    id = get_user_organization_id()
  );

-- Only super admins can insert organizations
CREATE POLICY "organizations_insert" ON organizations
  FOR INSERT
  WITH CHECK (get_user_role() = 'super_admin');

-- Super admins can update all organizations
-- Org admins can update their own organization settings
CREATE POLICY "organizations_update" ON organizations
  FOR UPDATE
  USING (
    get_user_role() = 'super_admin' OR
    (get_user_role() = 'org_admin' AND id = get_user_organization_id())
  );

-- Only super admins can delete organizations
CREATE POLICY "organizations_delete" ON organizations
  FOR DELETE
  USING (get_user_role() = 'super_admin');

-- =============================================
-- USER PROFILES TABLE POLICIES
-- =============================================

-- Users can see profiles in their organization
-- Super admins can see all profiles
CREATE POLICY "user_profiles_select" ON user_profiles
  FOR SELECT
  USING (
    get_user_role() = 'super_admin' OR
    organization_id = get_user_organization_id() OR
    id = auth.uid()
  );

-- Super admins and org admins can insert new users
CREATE POLICY "user_profiles_insert" ON user_profiles
  FOR INSERT
  WITH CHECK (
    get_user_role() = 'super_admin' OR
    (get_user_role() = 'org_admin' AND organization_id = get_user_organization_id()) OR
    id = auth.uid()
  );

-- Users can update their own profile
-- Org admins can update profiles in their organization
-- Super admins can update any profile
CREATE POLICY "user_profiles_update" ON user_profiles
  FOR UPDATE
  USING (
    get_user_role() = 'super_admin' OR
    (get_user_role() = 'org_admin' AND organization_id = get_user_organization_id()) OR
    id = auth.uid()
  );

-- =============================================
-- CALLS TABLE POLICIES
-- =============================================

-- Users can see calls from their organization
CREATE POLICY "calls_select" ON calls
  FOR SELECT
  USING (
    get_user_role() = 'super_admin' OR
    organization_id = get_user_organization_id()
  );

-- Allow system/API to insert calls (for Twilio webhooks)
CREATE POLICY "calls_insert" ON calls
  FOR INSERT
  WITH CHECK (
    get_user_role() = 'super_admin' OR
    organization_id = get_user_organization_id()
  );

-- Allow updates for call completion, transcripts, etc.
CREATE POLICY "calls_update" ON calls
  FOR UPDATE
  USING (
    get_user_role() = 'super_admin' OR
    organization_id = get_user_organization_id()
  );

-- =============================================
-- CALL MESSAGES TABLE POLICIES
-- =============================================

-- Users can see messages for calls in their organization
CREATE POLICY "call_messages_select" ON call_messages
  FOR SELECT
  USING (
    get_user_role() = 'super_admin' OR
    EXISTS (
      SELECT 1 FROM calls 
      WHERE calls.id = call_messages.call_id 
      AND calls.organization_id = get_user_organization_id()
    )
  );

-- Allow system to insert call messages
CREATE POLICY "call_messages_insert" ON call_messages
  FOR INSERT
  WITH CHECK (
    get_user_role() = 'super_admin' OR
    EXISTS (
      SELECT 1 FROM calls 
      WHERE calls.id = call_messages.call_id 
      AND calls.organization_id = get_user_organization_id()
    )
  );

-- =============================================
-- APPOINTMENT TYPES TABLE POLICIES
-- =============================================

-- Users can see appointment types for their organization
CREATE POLICY "appointment_types_select" ON appointment_types
  FOR SELECT
  USING (
    get_user_role() = 'super_admin' OR
    organization_id = get_user_organization_id()
  );

-- Org admins can manage appointment types
CREATE POLICY "appointment_types_insert" ON appointment_types
  FOR INSERT
  WITH CHECK (
    get_user_role() = 'super_admin' OR
    (get_user_role() IN ('org_admin', 'agent') AND organization_id = get_user_organization_id())
  );

CREATE POLICY "appointment_types_update" ON appointment_types
  FOR UPDATE
  USING (
    get_user_role() = 'super_admin' OR
    (get_user_role() IN ('org_admin', 'agent') AND organization_id = get_user_organization_id())
  );

-- =============================================
-- APPOINTMENTS TABLE POLICIES
-- =============================================

-- Users can see appointments for their organization
CREATE POLICY "appointments_select" ON appointments
  FOR SELECT
  USING (
    get_user_role() = 'super_admin' OR
    organization_id = get_user_organization_id()
  );

-- Allow appointment creation via AI or staff
CREATE POLICY "appointments_insert" ON appointments
  FOR INSERT
  WITH CHECK (
    get_user_role() = 'super_admin' OR
    organization_id = get_user_organization_id()
  );

-- Allow appointment updates
CREATE POLICY "appointments_update" ON appointments
  FOR UPDATE
  USING (
    get_user_role() = 'super_admin' OR
    organization_id = get_user_organization_id()
  );

-- =============================================
-- AVAILABILITY WINDOWS TABLE POLICIES
-- =============================================

CREATE POLICY "availability_windows_select" ON availability_windows
  FOR SELECT
  USING (
    get_user_role() = 'super_admin' OR
    organization_id = get_user_organization_id()
  );

CREATE POLICY "availability_windows_insert" ON availability_windows
  FOR INSERT
  WITH CHECK (
    get_user_role() = 'super_admin' OR
    (get_user_role() IN ('org_admin', 'agent') AND organization_id = get_user_organization_id())
  );

CREATE POLICY "availability_windows_update" ON availability_windows
  FOR UPDATE
  USING (
    get_user_role() = 'super_admin' OR
    (get_user_role() IN ('org_admin', 'agent') AND organization_id = get_user_organization_id())
  );

-- =============================================
-- PAYMENTS TABLE POLICIES
-- =============================================

-- Users can see payments for their organization
CREATE POLICY "payments_select" ON payments
  FOR SELECT
  USING (
    get_user_role() = 'super_admin' OR
    organization_id = get_user_organization_id()
  );

-- Allow payment creation via Stripe webhooks or staff
CREATE POLICY "payments_insert" ON payments
  FOR INSERT
  WITH CHECK (
    get_user_role() = 'super_admin' OR
    organization_id = get_user_organization_id()
  );

-- Allow payment updates for status changes, refunds, etc.
CREATE POLICY "payments_update" ON payments
  FOR UPDATE
  USING (
    get_user_role() = 'super_admin' OR
    organization_id = get_user_organization_id()
  );

-- =============================================
-- ORGANIZATION BRANDING TABLE POLICIES
-- =============================================

CREATE POLICY "organization_branding_select" ON organization_branding
  FOR SELECT
  USING (
    get_user_role() = 'super_admin' OR
    organization_id = get_user_organization_id()
  );

CREATE POLICY "organization_branding_insert" ON organization_branding
  FOR INSERT
  WITH CHECK (
    get_user_role() = 'super_admin' OR
    (get_user_role() = 'org_admin' AND organization_id = get_user_organization_id())
  );

CREATE POLICY "organization_branding_update" ON organization_branding
  FOR UPDATE
  USING (
    get_user_role() = 'super_admin' OR
    (get_user_role() = 'org_admin' AND organization_id = get_user_organization_id())
  );

-- =============================================
-- AI SCRIPTS TABLE POLICIES
-- =============================================

CREATE POLICY "ai_scripts_select" ON ai_scripts
  FOR SELECT
  USING (
    get_user_role() = 'super_admin' OR
    organization_id = get_user_organization_id()
  );

CREATE POLICY "ai_scripts_insert" ON ai_scripts
  FOR INSERT
  WITH CHECK (
    get_user_role() = 'super_admin' OR
    (get_user_role() IN ('org_admin', 'agent') AND organization_id = get_user_organization_id())
  );

CREATE POLICY "ai_scripts_update" ON ai_scripts
  FOR UPDATE
  USING (
    get_user_role() = 'super_admin' OR
    (get_user_role() IN ('org_admin', 'agent') AND organization_id = get_user_organization_id())
  );

-- =============================================
-- DAILY ANALYTICS TABLE POLICIES
-- =============================================

CREATE POLICY "daily_analytics_select" ON daily_analytics
  FOR SELECT
  USING (
    get_user_role() = 'super_admin' OR
    organization_id = get_user_organization_id()
  );

-- Allow system to insert analytics
CREATE POLICY "daily_analytics_insert" ON daily_analytics
  FOR INSERT
  WITH CHECK (
    get_user_role() = 'super_admin' OR
    organization_id = get_user_organization_id()
  );

CREATE POLICY "daily_analytics_update" ON daily_analytics
  FOR UPDATE
  USING (
    get_user_role() = 'super_admin' OR
    organization_id = get_user_organization_id()
  );

-- =============================================
-- INTEGRATIONS TABLE POLICIES
-- =============================================

CREATE POLICY "integrations_select" ON integrations
  FOR SELECT
  USING (
    get_user_role() = 'super_admin' OR
    organization_id = get_user_organization_id()
  );

CREATE POLICY "integrations_insert" ON integrations
  FOR INSERT
  WITH CHECK (
    get_user_role() = 'super_admin' OR
    (get_user_role() = 'org_admin' AND organization_id = get_user_organization_id())
  );

CREATE POLICY "integrations_update" ON integrations
  FOR UPDATE
  USING (
    get_user_role() = 'super_admin' OR
    (get_user_role() = 'org_admin' AND organization_id = get_user_organization_id())
  );

-- =============================================
-- SERVICE ROLE BYPASS POLICIES
-- =============================================

-- Allow service role to bypass RLS for automated operations
-- (Twilio webhooks, Stripe webhooks, scheduled analytics, etc.)

-- This should be used sparingly and with proper authentication
-- in edge functions using service role key