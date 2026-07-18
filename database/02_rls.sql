-- ENABLE RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper Function to get current app user based on Supabase auth.uid()
CREATE OR REPLACE FUNCTION current_app_user_id() RETURNS UUID AS $$
  SELECT id FROM users WHERE auth_provider_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION current_user_role() RETURNS user_role AS $$
  SELECT role FROM users WHERE auth_provider_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_super_admin() RETURNS BOOLEAN AS $$
  SELECT current_user_role() = 'super_admin'::user_role;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION has_event_assignment(check_event_id UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM event_staff_assignments 
    WHERE event_id = check_event_id 
    AND user_id = current_app_user_id()
  );
$$ LANGUAGE sql STABLE;

-- USERS Table
-- Super Admin can see all, others can see themselves and users in same events
CREATE POLICY "Super admin can manage users" ON users 
  FOR ALL USING (is_super_admin());
CREATE POLICY "Users can read themselves" ON users 
  FOR SELECT USING (id = current_app_user_id());

-- EVENTS Table
-- Super Admin sees all. Others see events they are assigned to.
-- Public can see published events (only SELECT).
CREATE POLICY "Public can read published events" ON events
  FOR SELECT USING (status = 'published');
CREATE POLICY "Super admin manage events" ON events 
  FOR ALL USING (is_super_admin());
CREATE POLICY "Assigned staff can read events" ON events 
  FOR SELECT USING (has_event_assignment(id));

-- EVENT STAFF ASSIGNMENTS
CREATE POLICY "Super admin manage assignments" ON event_staff_assignments 
  FOR ALL USING (is_super_admin());
CREATE POLICY "Staff can see assignments for their events" ON event_staff_assignments 
  FOR SELECT USING (has_event_assignment(event_id));

-- PARTICIPANTS
-- Super Admin all. Staff can see participants in their assigned events. 
-- Public can insert (via API with service role bypassing RLS, or we can allow anonymous insert). 
-- Let's allow insert for anyone so public form works without auth, but only service_role can do it securely via API. 
-- For RLS we will just use service_role to insert public registrations.
CREATE POLICY "Super admin manage participants" ON participants 
  FOR ALL USING (is_super_admin());
CREATE POLICY "Staff manage assigned participants" ON participants 
  FOR ALL USING (has_event_assignment(event_id));

-- TICKETS
CREATE POLICY "Super admin manage tickets" ON tickets 
  FOR ALL USING (is_super_admin());
CREATE POLICY "Staff manage assigned event tickets" ON tickets 
  FOR ALL USING (has_event_assignment(event_id));

-- ATTENDANCES
CREATE POLICY "Super admin manage attendances" ON attendances 
  FOR ALL USING (is_super_admin());
CREATE POLICY "Staff manage assigned event attendances" ON attendances 
  FOR ALL USING (has_event_assignment(event_id));

-- EMAIL TEMPLATES
CREATE POLICY "Super admin manage email templates" ON email_templates 
  FOR ALL USING (is_super_admin());
CREATE POLICY "Staff manage assigned event email templates" ON email_templates 
  FOR ALL USING (has_event_assignment(event_id));

-- BROADCASTS
CREATE POLICY "Super admin manage broadcasts" ON broadcasts 
  FOR ALL USING (is_super_admin());
CREATE POLICY "Staff manage assigned event broadcasts" ON broadcasts 
  FOR ALL USING (has_event_assignment(event_id));

-- EMAIL MESSAGES
CREATE POLICY "Super admin manage email messages" ON email_messages 
  FOR ALL USING (is_super_admin());
CREATE POLICY "Staff manage assigned event email messages" ON email_messages 
  FOR ALL USING (has_event_assignment(event_id));

-- IMPORT JOBS
CREATE POLICY "Super admin manage import jobs" ON import_jobs 
  FOR ALL USING (is_super_admin());
CREATE POLICY "Staff manage assigned event import jobs" ON import_jobs 
  FOR ALL USING (has_event_assignment(event_id));

-- EXPORT JOBS
CREATE POLICY "Super admin manage export jobs" ON export_jobs 
  FOR ALL USING (is_super_admin());
CREATE POLICY "Staff manage assigned event export jobs" ON export_jobs 
  FOR ALL USING (has_event_assignment(event_id));

-- AUDIT LOGS
CREATE POLICY "Super admin can read all audit logs" ON audit_logs 
  FOR SELECT USING (is_super_admin());
CREATE POLICY "Staff can read audit logs for their events" ON audit_logs 
  FOR SELECT USING (has_event_assignment(event_id));
