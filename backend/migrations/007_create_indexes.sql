CREATE INDEX idx_incidents_created_by
ON incidents(created_by);

CREATE INDEX idx_incidents_status
ON incidents(status);

CREATE INDEX idx_tasks_incident_id
ON tasks(incident_id);

CREATE INDEX idx_messages_incident_id_created_at
ON messages(incident_id, created_at);

CREATE INDEX idx_incident_events_incident_id_created_at
ON incident_events(incident_id, created_at);