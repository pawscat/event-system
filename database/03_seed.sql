-- Seed Users
-- For testing, we mock auth_provider_id with UUIDs. In real app, these come from Supabase Auth.
INSERT INTO users (id, full_name, email, role, auth_provider_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Super Admin', 'super@eventku.id', 'super_admin', 'a0000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002', 'Admin Event', 'adminevent@eventku.id', 'admin', 'a0000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000003', 'Admin Registrasi', 'adminreg@eventku.id', 'admin', 'a0000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000004', 'Admin Scanner', 'adminscan@eventku.id', 'admin', 'a0000000-0000-0000-0000-000000000004');

-- Seed Event
INSERT INTO events (id, slug, name, description, start_at, end_at, venue, capacity, status, created_by) VALUES
  ('11111111-1111-1111-1111-111111111111', 'seminar-nasional-2026', 'Seminar Nasional Transformasi Digital 2026', 'Event tahunan terbesar membahas transformasi digital di Indonesia.', '2026-08-15 09:00:00+07', '2026-08-15 17:00:00+07', 'Jakarta Convention Center', 1000, 'published', '00000000-0000-0000-0000-000000000001');

-- Seed Staff Assignments
INSERT INTO event_staff_assignments (event_id, user_id, role, manual_checkin_allowed, assigned_by) VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'event_admin', true, '00000000-0000-0000-0000-000000000001'),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000003', 'registration_admin', false, '00000000-0000-0000-0000-000000000002'),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000004', 'scanner_admin', true, '00000000-0000-0000-0000-000000000002');

-- Seed Participant
INSERT INTO participants (id, event_id, full_name, email_normalized, phone_number, organization, job_title, privacy_consent_at, registration_source, status) VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Budi Santoso', 'budi@example.com', '081234567890', 'PT Teknologi Maju', 'Software Engineer', NOW(), 'public_form', 'active');

-- Seed Ticket
INSERT INTO tickets (id, event_id, participant_id, guest_id, qr_token_hash, checkin_code_hash, ticket_status) VALUES
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'GUEST-1001', 'hashed_qr_token_123', 'hashed_code_abc', 'active');

-- Seed Email Template
INSERT INTO email_templates (event_id, type, name, subject, body, updated_by) VALUES
  ('11111111-1111-1111-1111-111111111111', 'ticket_delivery', 'Tiket Seminar Digital', 'Tiket Anda: Seminar Nasional Transformasi Digital 2026', 'Halo {{full_name}}, berikut adalah tiket Anda.', '00000000-0000-0000-0000-000000000002');
