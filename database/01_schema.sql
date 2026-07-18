-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE user_role AS ENUM ('super_admin', 'admin');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'registration_closed', 'completed', 'archived', 'cancelled');
CREATE TYPE staff_role AS ENUM ('event_admin', 'registration_admin', 'scanner_admin');
CREATE TYPE participant_status AS ENUM ('active', 'cancelled', 'disabled');
CREATE TYPE registration_source AS ENUM ('public_form', 'manual_admin', 'import');
CREATE TYPE ticket_status AS ENUM ('active', 'checked_in', 'cancelled', 'disabled');
CREATE TYPE checkin_method AS ENUM ('qr', 'manual');
CREATE TYPE email_status AS ENUM ('queued', 'sending', 'sent', 'delivered', 'failed', 'bounced', 'skipped');
CREATE TYPE broadcast_status AS ENUM ('draft', 'scheduled', 'sending', 'completed', 'partially_failed', 'cancelled');
CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- TABLES

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    auth_provider_id UUID, -- For Supabase Auth mapping
    role user_role NOT NULL DEFAULT 'admin',
    status VARCHAR(50) DEFAULT 'active',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    venue VARCHAR(255),
    capacity INT,
    status event_status NOT NULL DEFAULT 'draft',
    registration_open_at TIMESTAMPTZ,
    registration_close_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE event_staff_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role staff_role NOT NULL,
    manual_checkin_allowed BOOLEAN DEFAULT FALSE,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email_normalized VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    organization VARCHAR(255),
    job_title VARCHAR(255),
    privacy_consent_at TIMESTAMPTZ NOT NULL,
    registration_source registration_source NOT NULL,
    status participant_status NOT NULL DEFAULT 'active',
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, email_normalized)
);

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    guest_id VARCHAR(100) UNIQUE NOT NULL,
    qr_token_hash VARCHAR(255) NOT NULL,
    checkin_code_hash VARCHAR(255) NOT NULL,
    ticket_status ticket_status NOT NULL DEFAULT 'active',
    qr_version INT NOT NULL DEFAULT 1,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    disabled_at TIMESTAMPTZ,
    UNIQUE(participant_id)
);

CREATE TABLE attendances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMPTZ DEFAULT NOW(),
    method checkin_method NOT NULL,
    checked_in_by UUID REFERENCES users(id),
    device_label VARCHAR(255),
    UNIQUE(ticket_id)
);

CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE, -- NULL means global template
    type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE broadcasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body_snapshot TEXT NOT NULL,
    audience_rule JSONB NOT NULL,
    status broadcast_status NOT NULL DEFAULT 'draft',
    scheduled_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE email_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    broadcast_id UUID REFERENCES broadcasts(id) ON DELETE CASCADE,
    template_id UUID REFERENCES email_templates(id),
    message_type VARCHAR(100) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    status email_status NOT NULL DEFAULT 'queued',
    provider_message_id VARCHAR(255),
    attempt_count INT DEFAULT 0,
    queued_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT
);

CREATE TABLE import_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    initiated_by UUID REFERENCES users(id),
    status job_status NOT NULL DEFAULT 'pending',
    total_rows INT DEFAULT 0,
    valid_rows INT DEFAULT 0,
    invalid_rows INT DEFAULT 0,
    processed_rows INT DEFAULT 0,
    error_file_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE export_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    filters_snapshot JSONB,
    requested_by UUID REFERENCES users(id),
    status job_status NOT NULL DEFAULT 'pending',
    file_path TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    actor_user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    before_data JSONB,
    after_data JSONB,
    ip_hash VARCHAR(255),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_participants_event_registered ON participants(event_id, registered_at);
CREATE INDEX idx_participants_event_status ON participants(event_id, status);
CREATE INDEX idx_tickets_event_status ON tickets(event_id, ticket_status);
CREATE INDEX idx_tickets_qr_token_hash ON tickets(qr_token_hash);
CREATE INDEX idx_tickets_checkin_code_hash ON tickets(checkin_code_hash);
CREATE INDEX idx_attendances_event_time ON attendances(event_id, checked_in_at);
CREATE INDEX idx_email_messages_event_status ON email_messages(event_id, status);
CREATE INDEX idx_audit_logs_event_time ON audit_logs(event_id, created_at);

-- TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON participants FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_broadcasts_updated_at BEFORE UPDATE ON broadcasts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_import_jobs_updated_at BEFORE UPDATE ON import_jobs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_export_jobs_updated_at BEFORE UPDATE ON export_jobs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
