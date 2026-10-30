import { pool } from "../db/client.js";

export async function createIncident(title: string, description: string | undefined, severity: string, createdBy: string) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
        INSERT INTO incidents (
          title,
          description,
          severity,
          created_by
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [title, description ?? null, severity, createdBy],
    );

    const incident = result.rows[0];

    await client.query(
      `
      
        INSERT INTO incident_members (
          incident_id,
          user_id,
          role
        )
        VALUES ($1, $2, $3)
      `,
      [incident.id, createdBy, "OWNER"],
    );

    await client.query("COMMIT");

    return incident;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function findIncidents() {
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
        u.name AS creator_name
      FROM incidents i
      JOIN users u
        ON u.id = i.created_by
      ORDER BY i.created_at DESC
    `,
  );

  return result.rows;
}

export async function findIncidentById(id: string) {
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
            u.name AS creator_name
        FROM incidents i
        JOIN users u
            ON u.id = i.created_by
        WHERE i.id = $1
    `,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function updateIncident(id: string, title: string | undefined, description: string | null | undefined, severity: string | undefined) {
  const result = await pool.query(
    `
      UPDATE incidents
      SET
        title = CASE WHEN $2::boolean THEN $3::varchar ELSE title END,
        description = CASE WHEN $4::boolean THEN $5::text ELSE description END,
        severity = CASE WHEN $6::boolean THEN $7::varchar ELSE severity END,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [id, title !== undefined, title ?? null, description !== undefined, description ?? null, severity !== undefined, severity ?? null],
  );

  return result.rows[0] ?? null;
}

export async function updateIncidentStatus(id: string, status: string) {
  const result = await pool.query(
    `
      UPDATE incidents
      SET
        status = $2,
        resolved_at = CASE
          WHEN $2 = 'RESOLVED' THEN COALESCE(resolved_at, NOW())
          ELSE NULL
        END,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [id, status],
  );

  return result.rows[0] ?? null;
}
