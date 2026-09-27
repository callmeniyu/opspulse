import { pool } from "../db/client.js";

export async function createTask(incidentId: string, title: string, description: string | undefined, assignedTo?: string) {
  const result = await pool.query(
    `
      INSERT INTO tasks (
        incident_id,
        title,
        description,
        assigned_to
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [incidentId, title, description ?? null, assignedTo ?? null],
  );

  return result.rows[0];
}

export async function findTasks(incidentId: string) {
  const result = await pool.query(
    `
      SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.created_at,
        t.updated_at,

        u.id AS assigned_user_id,
        u.name AS assigned_user_name

      FROM tasks t

      LEFT JOIN users u
        ON u.id = t.assigned_to

      WHERE t.incident_id = $1

      ORDER BY t.created_at ASC
    `,
    [incidentId],
  );

  return result.rows;
}

export async function updateTask(id: string, title: string | undefined, description: string | undefined, assignedTo: string | null | undefined, status: string | undefined) {
  const result = await pool.query(
    `
      UPDATE tasks
      SET
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        assigned_to = COALESCE($4, assigned_to),
        status = COALESCE($5, status),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [id, title ?? null, description ?? null, assignedTo, status ?? null],
  );

  return result.rows[0] ?? null;
}
