import { beforeEach, describe, expect, it, vi } from "vitest";

import { createIncident, findIncidentById, updateIncident, updateIncidentStatus } from "../../repositories/incident.repository.js";

import { getIncidentRole } from "../../repositories/incident-access.repository.js";

import { changeStatus } from "../../services/incident.service.js";

vi.mock("../../repositories/incident.repository.js", () => ({
  createIncident: vi.fn(),
  findIncidents: vi.fn(),
  findIncidentById: vi.fn(),
  updateIncident: vi.fn(),
  updateIncidentStatus: vi.fn(),
}));

vi.mock("../../repositories/incident-access.repository.js", () => ({
  findIncidentOwner: vi.fn(),
  findIncidentsForUser: vi.fn(),
  getIncidentRole: vi.fn(),
}));

const incidentId = "incident-123";
const userId = "user-123";

describe("changeStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows an incident owner to change status", async () => {
    vi.mocked(findIncidentById).mockResolvedValue({
      id: incidentId,
    } as never);

    vi.mocked(getIncidentRole).mockResolvedValue("OWNER");

    vi.mocked(updateIncidentStatus).mockResolvedValue({
      id: incidentId,
      status: "RESOLVED",
    } as never);

    const result = await changeStatus(incidentId, { status: "RESOLVED" }, userId);

    expect(result.status).toBe("RESOLVED");

    expect(updateIncidentStatus).toHaveBeenCalledWith(incidentId, "RESOLVED");
  });
});
