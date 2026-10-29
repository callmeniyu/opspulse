import { pool } from "../db/client.js";
import type { UpdateTaskInput } from "../validators/task.validator.js";

export async function createTask(incidentId: string, title: string, description: string | null | undefined, createdBy: string, assignedTo?: string | null | undefined) {
  const result = await pool.query(
    `
      INSERT INTO tasks (
        incident_id,
        title,
        description,
        assigned_to,
        created_by
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [incidentId, title, description ?? null, assignedTo ?? null, createdBy],
  );

  return result.rows[0];
}

export async function findTasks(incidentId: string) {
  const result = await pool.query(
    `
      SELECT
        t.id,
        t.incident_id,
        t.title,
        t.description,
        t.status,
        t.created_at,
        t.updated_at,
        t.created_by,
        t.assigned_to AS assigned_user_id,
        u.name AS assigned_user_name
      FROM tasks t
      LEFT JOIN users u ON u.id = t.assigned_to
      WHERE t.incident_id = $1
      ORDER BY
        CASE t.status
          WHEN 'IN_PROGRESS' THEN 0
          WHEN 'TODO' THEN 1
          WHEN 'COMPLETED' THEN 2
          ELSE 3
        END,
        t.created_at DESC
    `,
    [incidentId],
  );

  return result.rows;
}

export async function findTaskById(taskId: string) {
  const result = await pool.query(
    `
      SELECT
        id,
        incident_id,
        title,
        description,
        status,
        assigned_to,
        created_by,
        created_at,
        updated_at
      FROM tasks
      WHERE id = $1
    `,
    [taskId],
  );

  return result.rows[0] ?? null;
}

export async function updateTask(taskId: string, input: UpdateTaskInput) {
  const result = await pool.query(
    `
      UPDATE tasks
      SET
        title = CASE WHEN $2::boolean THEN $3::varchar ELSE title END,
        description = CASE WHEN $4::boolean THEN $5::text ELSE description END,
        assigned_to = CASE WHEN $6::boolean THEN $7::uuid ELSE assigned_to END,
        status = CASE WHEN $8::boolean THEN $9::varchar ELSE status END,
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        incident_id,
        title,
        description,
        status,
        assigned_to,
        created_by,
        created_at,
        updated_at
    `,
    [taskId, input.title !== undefined, input.title ?? null, input.description !== undefined, input.description ?? null, input.assignedTo !== undefined, input.assignedTo ?? null, input.status !== undefined, input.status ?? null],
  );

  return result.rows[0] ?? null;
}

export async function deleteTask(taskId: string) {
  const result = await pool.query(
    `
      DELETE FROM tasks
      WHERE id = $1
      RETURNING id, incident_id, title
    `,
    [taskId],
  );

  return result.rows[0] ?? null;
}
