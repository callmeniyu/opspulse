import { pool } from "../db/client.js";
import type { IncidentMemberRole } from "../types/incident-member.js";

export async function addMember(incidentId: string, userId: string, role: IncidentMemberRole) {
  const result = await pool.query(
    `
        INSERT INTO incident_members (
            incident_id,
            user_id,
            role
        )
        VALUES ($1, $2, $3)
        RETURNING *
        `,
    [incidentId, userId, role],
  );

  return result.rows[0];
}

export async function findMembers(incidentId: string) {
  const result = await pool.query(
    `
       SELECT
        u.id,
        u.name,
        u.email,
        im.role,
        im.joined_at
      FROM incident_members im
      JOIN users u
        ON  im.user_id = u.id
      WHERE im.incident_id = $1
      ORDER BY im.joined_at ASC
        `,
    [incidentId],
  );

  return result.rows;
}

export async function removeMember(incidentId: string, userId: string) {
  const result = await pool.query(
    `
        DELETE FROM incident_members
        WHERE incident_id = $1 AND user_id = $2
        RETURNING *
    `,
    [incidentId, userId],
  );
  return result.rows[0];
}
