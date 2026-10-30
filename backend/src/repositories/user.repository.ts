import { pool } from "../db/client.js";

export async function createUser(name: string, email: string, passwordHash: string) {
  const result = await pool.query(
    `
        INSERT INTO users (name, email, password_hash)
        VALUES($1, $2, $3)
        RETURNING id,name, email, created_at, updated_at
        `,
    [name, email, passwordHash],
  );

  return result.rows[0];
}

export async function findUserByEmail(email: string) {
  const result = await pool.query(
    `
         SELECT id, name, email, password_hash, created_at, updated_at
         FROM users
         WHERE email = $1
        `,
    [email],
  );
  return result.rows[0] ?? null;
}

export async function findUserCandidateByEmail(email: string) {
  const result = await pool.query(
    `
      SELECT id, name, email
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `,
    [email.trim()],
  );

  return result.rows[0] ?? null;
}

export async function findUserById(id: string) {
  const result = await pool.query(
    `
      SELECT id, name, email, created_at, updated_at
      FROM users
      WHERE id = $1
    `,
    [id],
  );

  return result.rows[0] ?? null;
}
