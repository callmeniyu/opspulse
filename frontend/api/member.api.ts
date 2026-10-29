import { apiFetch } from "@/lib/apiFetch";
import { IncidentMember, IncidentMemberRole } from "@/types/memberTypes";

export interface MemberCandidate {
  id: string;
  name: string;
  email: string;
}

export interface AddIncidentMemberInput {
  userId: string;
  role: Extract<IncidentMemberRole, "RESPONDER" | "VIEWER">;
}

export async function findMemberCandidate(incidentId: string, email: string): Promise<MemberCandidate> {
  const response = await apiFetch<{ user: MemberCandidate }>(`/incidents/${incidentId}/member-candidates?email=${encodeURIComponent(email.trim())}`);

  return response.user;
}

export async function addMemberToIncident(incidentId: string, memberData: AddIncidentMemberInput) {
  const response = await apiFetch<{ member: IncidentMember }>(`/incidents/${incidentId}/members`, {
    method: "POST",
    body: JSON.stringify(memberData),
  });
  return response.member;
}
export async function getMembersByIncidentId(incidentId: string) {
  const response = await apiFetch<{ members: IncidentMember[] }>(`/incidents/${incidentId}/members`);
  return response.members;
}

export async function removeMemberFromIncident(incidentId: string, userId: string) {
  const response = await apiFetch<{ member: IncidentMember }>(`/incidents/${incidentId}/members/${userId}`, {
    method: "DELETE",
  });
  return response.member;
}
