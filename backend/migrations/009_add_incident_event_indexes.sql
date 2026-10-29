
CREATE INDEX IF NOT EXISTS idx_incident_events_incident_created_at
ON incident_events (incident_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_incident_events_user_id
ON incident_events (user_id);
