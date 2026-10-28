import { pool } from "../db/client.js";

export async function findTasksAssignedToUser(userId: string) {
  const result = await pool.query(
    `
      SELECT
        t.id,
        t.incident_id,
        t.title,
        t.description,
        t.status,
        t.assigned_to AS assigned_user_id,
        assigned_user.name AS assigned_user_name,
        t.created_at,
        t.updated_at,

        i.title AS incident_title,
        i.status AS incident_status,
        i.severity AS incident_severity

      FROM tasks t
      INNER JOIN incidents i
        ON i.id = t.incident_id
      INNER JOIN incident_members im
        ON im.incident_id = t.incident_id
       AND im.user_id = $1
      LEFT JOIN users assigned_user
        ON assigned_user.id = t.assigned_to

      WHERE t.assigned_to = $1

      ORDER BY
        CASE t.status
          WHEN 'IN_PROGRESS' THEN 0
          WHEN 'TODO' THEN 1
          WHEN 'COMPLETED' THEN 2
          ELSE 3
        END,
        t.updated_at DESC
    `,
    [userId],
  );

  return result.rows;
}

export async function findTeamsForUser(userId: string) {
  const result = await pool.query(
    `
      SELECT
        i.id AS incident_id,
        i.title AS incident_title,
        i.description AS incident_description,
        i.status AS incident_status,
        i.severity AS incident_severity,
        i.created_at AS incident_created_at,
        i.updated_at AS incident_updated_at,
        i.created_by,
        im.role AS current_user_role,
        im.joined_at,

        COALESCE(member_counts.member_count, 0)::int AS member_count,
        COALESCE(task_counts.open_task_count, 0)::int AS open_task_count

      FROM incident_members im
      INNER JOIN incidents i
        ON i.id = im.incident_id

      LEFT JOIN (
        SELECT incident_id, COUNT(*) AS member_count
        FROM incident_members
        GROUP BY incident_id
      ) member_counts
        ON member_counts.incident_id = i.id

      LEFT JOIN (
        SELECT incident_id, COUNT(*) AS open_task_count
        FROM tasks
        WHERE status <> 'COMPLETED'
        GROUP BY incident_id
      ) task_counts
        ON task_counts.incident_id = i.id

      WHERE im.user_id = $1

      ORDER BY
        CASE i.status
          WHEN 'OPEN' THEN 0
          WHEN 'INVESTIGATING' THEN 1
          WHEN 'MITIGATED' THEN 2
          WHEN 'RESOLVED' THEN 3
          ELSE 4
        END,
        i.updated_at DESC
    `,
    [userId],
  );

  return result.rows;
}
