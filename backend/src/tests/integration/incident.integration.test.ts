import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { randomUUID } from "node:crypto";

import app from "../../app.js";
import { pool } from "../../db/client.js";
import { createAccessToken } from "../../utils/tokens.js";

describe("POST /api/incidents - database integration", () => {
  const userId = randomUUID();
  const outsiderId = randomUUID();
  const fixtureIncidentId = randomUUID();
  const email = `integration-${randomUUID()}@test.com`;

  let accessToken: string;
  let outsiderToken: string;

  beforeAll(async () => {
    const databaseResult = await pool.query("SELECT current_database() AS name");

    expect(databaseResult.rows[0].name).toBe("opspulse_test");

    await pool.query(
      `
        INSERT INTO users (id, name, email, password_hash)
        VALUES ($1, $2, $3, $4)
      `,
      [userId, "Integration Tester", email, "test_hash"],
    );

    accessToken = createAccessToken(userId);

    // Create a second user who is NOT a member of the incident.
    await pool.query(
      `
    INSERT INTO users (id, name, email, password_hash)
    VALUES ($1, $2, $3, $4)
  `,
      [outsiderId, "Non Member", `outsider-${randomUUID()}@test.com`, "test-hash"],
    );

    outsiderToken = createAccessToken(outsiderId);

    // Create an incident owned by the first user.
    await pool.query(
      `
    INSERT INTO incidents (id, title, severity, created_by)
    VALUES ($1, $2, $3, $4)
  `,
      [fixtureIncidentId, "Authorization Test Incident", "SEV2", userId],
    );

    // Add only the first user as OWNER.
    await pool.query(
      `
    INSERT INTO incident_members (incident_id, user_id, role)
    VALUES ($1, $2, $3)
  `,
      [fixtureIncidentId, userId, "OWNER"],
    );
  });

  afterAll(async () => {
    await pool.query("DELETE FROM incidents WHERE created_by = $1", [userId]);

    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    await pool.query("DELETE FROM users WHERE id = $1", [outsiderId]);

    await pool.end();
  });

  it("denies incident access to a non-member", async () => {
    const response = await request(app).get(`/api/incidents/${fixtureIncidentId}`).set("Authorization", `Bearer ${outsiderToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toContain("You do not have access to this incident");
  });

  it("rejects an incident with a non-existent creator", async () => {
    const nonExistentUserId = randomUUID();

    await expect(
      pool.query(
        `
        INSERT INTO incidents (title, severity, created_by)
        VALUES ($1, $2, $3)
      `,
        ["Invalid Incident", "SEV1", nonExistentUserId],
      ),
    ).rejects.toMatchObject({
      code: "23503",
    });
  });

  it("creates an incident, assigns its owner, and records its creation event", async () => {
    const response = await request(app).post("/api/incidents").set("Authorization", `Bearer ${accessToken}`).send({
      title: "Database connection failure",
      description: "Production database is unavailable",
      severity: "SEV1",
    });

    expect(response.status).toBe(201);
    expect(response.body.incident.title).toBe("Database connection failure");

    const incidentId = response.body.incident.id;

    const incidentResult = await pool.query("SELECT * FROM incidents WHERE id = $1", [incidentId]);

    expect(incidentResult.rows).toHaveLength(1);
    expect(incidentResult.rows[0].created_by).toBe(userId);
    expect(incidentResult.rows[0].severity).toBe("SEV1");

    // Verify the creator was automatically added as OWNER.
    const memberResult = await pool.query(
      `
        SELECT role
        FROM incident_members
        WHERE incident_id = $1 AND user_id = $2
      `,
      [incidentId, userId],
    );

    expect(memberResult.rows).toHaveLength(1);
    expect(memberResult.rows[0].role).toBe("OWNER");

    // Verify the activity event was persisted.
    const eventResult = await pool.query(
      `
        SELECT event_type, metadata
        FROM incident_events
        WHERE incident_id = $1
      `,
      [incidentId],
    );

    expect(eventResult.rows).toHaveLength(1);
    expect(eventResult.rows[0].event_type).toBe("INCIDENT_CREATED");
    expect(eventResult.rows[0].metadata.title).toBe("Database connection failure");
  });
});
