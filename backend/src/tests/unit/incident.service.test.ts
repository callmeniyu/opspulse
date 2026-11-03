import { beforeEach, describe, expect, it, vi } from "vitest";

import { createIncident, findIncidentById, updateIncident, updateIncidentStatus } from "../../repositories/incident.repository.js";

import { getIncidentRole } from "../../repositories/incident-access.repository.js";

import { changeStatus } from "../../services/incident.service.js";
import { record } from "../../services/incident-event.service.js";

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

vi.mock("../../services/incident-event.service.js", () => ({
  record: vi.fn(),
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
      status: "OPEN",
    } as never);

    vi.mocked(getIncidentRole).mockResolvedValue("OWNER");

    vi.mocked(updateIncidentStatus).mockResolvedValue({
      id: incidentId,
      status: "RESOLVED",
    } as never);

    vi.mocked(record).mockResolvedValue({
      id: "abc123",
    });

    const result = await changeStatus(incidentId, { status: "RESOLVED" }, userId);

    expect(result.status).toBe("RESOLVED");

    expect(updateIncidentStatus).toHaveBeenCalledWith(incidentId, "RESOLVED");

    expect(record).toHaveBeenCalledWith(incidentId, userId, "INCIDENT_STATUS_CHANGED", { old_status: "OPEN", new_status: "RESOLVED" });
  });

  it("rejects a viewer from changing incident status", async () => {
    vi.mocked(findIncidentById).mockResolvedValue({
      id: incidentId,
      status: "OPEN",
    } as never);

    vi.mocked(getIncidentRole).mockResolvedValue("VIEWER");

    await expect(changeStatus(incidentId, { status: "RESOLVED" }, userId)).rejects.toMatchObject({
      status: 403,
    });

    expect(updateIncidentStatus).not.toHaveBeenCalled();
  });

  it("rejects a user who is not an incident member", async () => {
    vi.mocked(findIncidentById).mockResolvedValue({
      id: incidentId,
      status: "OPEN",
    } as never);

    vi.mocked(getIncidentRole).mockResolvedValue(null);

    await expect(changeStatus(incidentId, { status: "RESOLVED" }, userId)).rejects.toMatchObject({
      status: 403,
    });

    expect(updateIncidentStatus).not.toHaveBeenCalled();
  });

  it("returns 404 when the incident does not exist", async () => {
    vi.mocked(findIncidentById).mockResolvedValue(null);

    await expect(changeStatus(incidentId, { status: "RESOLVED" }, userId)).rejects.toMatchObject({
      status: 404,
    });

    expect(getIncidentRole).not.toHaveBeenCalled();
    expect(updateIncidentStatus).not.toHaveBeenCalled();
  });
});
