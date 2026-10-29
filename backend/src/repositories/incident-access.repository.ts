import { pool } from "../db/client.js";
import type { IncidentMemberRole } from "../types/incidentMemberTypes.js";

type IncidentAccessRole = IncidentMemberRole;

export async function getIncidentRole(incidentId: string, userId: string): Promise<IncidentAccessRole | null> {
  const result = await pool.query<{ role: IncidentAccessRole }>(
    `
      SELECT role
      FROM incident_members
      WHERE incident_id = $1
        AND user_id = $2
      LIMIT 1
    `,
    [incidentId, userId],
  );

  return result.rows[0]?.role ?? null;
}

export async function findIncidentsForUser(userId: string) {
  const result = await pool.query(
    `
      SELECT
        i.id,
        i.title,
        i.description,
        i.status,
        i.severity,
        i.created_by,
        i.created_at,
        i.updated_at,
        i.resolved_at,
        u.name AS creator_name,
        im.role AS current_user_role
      FROM incident_members im
      JOIN incidents i ON i.id = im.incident_id
      JOIN users u ON u.id = i.created_by
      WHERE im.user_id = $1
      ORDER BY i.created_at DESC
    `,
    [userId],
  );

  return result.rows;
}
