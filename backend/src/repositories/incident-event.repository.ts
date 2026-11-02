import { pool } from "../db/client.js";
import type { IncidentEventType } from "../types/incidentEventType.js";

export async function createIncidentEvent(incidentId: string, userId: string | null, eventType: IncidentEventType, metadata: Record<string, unknown> = {}) {
  const result = await pool.query(
    `
      INSERT INTO incident_events (
        incident_id,
        user_id,
        event_type,
        metadata
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [incidentId, userId, eventType, JSON.stringify(metadata)],
  );

  return result.rows[0];
}

export async function findIncidentEvents(incidentId: string) {
  const result = await pool.query(
    `
      SELECT
        e.id,
        e.incident_id,
        e.user_id,
        e.event_type,
        e.metadata,
        e.created_at,
        u.name AS user_name
      FROM incident_events e
      LEFT JOIN users u
        ON u.id = e.user_id
      WHERE e.incident_id = $1
      ORDER BY e.created_at DESC, e.id DESC
    `,
    [incidentId],
  );

  return result.rows;
}
