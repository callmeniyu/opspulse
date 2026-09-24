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
