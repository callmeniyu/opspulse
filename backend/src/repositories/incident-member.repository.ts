import { pool } from "../db/client.js";
import type { IncidentMemberRole } from "../types/incidentMemberTypes.js";

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
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Keep tasks within this incident assigned only to its current members.
    await client.query(
      `
        UPDATE tasks
        SET assigned_to = NULL, updated_at = NOW()
        WHERE incident_id = $1 AND assigned_to = $2
      `,
      [incidentId, userId],
    );

    const result = await client.query(
      `
        DELETE FROM incident_members
        WHERE incident_id = $1 AND user_id = $2
        RETURNING incident_id, user_id, role
      `,
      [incidentId, userId],
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function isIncidentMember(incidentId: string, userId: string): Promise<boolean> {
  const result = await pool.query(
    `
      SELECT 1
      FROM incident_members
      WHERE incident_id = $1
        AND user_id = $2
      LIMIT 1
    `,
    [incidentId, userId],
  );

  return result.rowCount !== null && result.rowCount > 0;
}
