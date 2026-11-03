import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

import app from "../../app.js";
import * as incidentService from "../../services/incident.service.js";
import { createAccessToken } from "../../utils/tokens.js";

vi.mock("../../services/incident.service.js", () => ({
  create: vi.fn(),
  list: vi.fn(),
  getById: vi.fn(),
  update: vi.fn(),
  changeStatus: vi.fn(),
}));

const incidentId = "incident-123";
const userId = "user-123";

describe("PATCH /api/incidents/:id/status", () => {
  let accessToken: string;

  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = "test-access-secret";
    process.env.JWT_REFRESH_SECRET = "test-refresh-secret";

    accessToken = createAccessToken(userId);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no access token is provided", async () => {
    const response = await request(app).patch(`/api/incidents/${incidentId}/status`).send({ status: "RESOLVED" });

    expect(response.status).toBe(401);

    expect(response.body.message).toBe("Access token required");

    expect(incidentService.changeStatus).not.toHaveBeenCalled();
  });

  it("returns 400 when an invalid status is provided", async () => {
    const response = await request(app).patch(`/api/incidents/${incidentId}/status`).set("Authorization", `Bearer ${accessToken}`).send({ status: "INVALID_STATUS" });

    expect(response.status).toBe(400);

    expect(response.body.message).toBe("Validation failed");

    expect(incidentService.changeStatus).not.toHaveBeenCalled();
  });

  it("updates incident status with a valid request", async () => {
    vi.mocked(incidentService.changeStatus).mockResolvedValue({
      id: incidentId,
      status: "RESOLVED",
    } as never);

    const response = await request(app).patch(`/api/incidents/${incidentId}/status`).set("Authorization", `Bearer ${accessToken}`).send({ status: "RESOLVED" });

    expect(response.status).toBe(200);

    expect(response.body.incident.status).toBe("RESOLVED");

    expect(incidentService.changeStatus).toHaveBeenCalledWith(incidentId, { status: "RESOLVED" }, userId);
  });
});
