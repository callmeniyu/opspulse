CREATE TABLE incident_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,

    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    event_type VARCHAR(50) NOT NULL,

    metadata JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);