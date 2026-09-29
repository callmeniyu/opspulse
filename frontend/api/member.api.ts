import { apiClient } from "@/lib/apiClient";
import { IncidentMember } from "@/types/memberTypes";

export async function addMemberToIncident(incidentId: string, memberData: IncidentMember){
  const response = await apiClient<{ member: IncidentMember }>(`/incidents/${incidentId}/members`, {
    method: "POST",
    body: JSON.stringify(memberData),
  });
  return response.member;
}
export async function getMembersByIncidentId(incidentId: string){
  const response = await apiClient<{ members: IncidentMember[] }>(`/incidents/${incidentId}/members`);
  return response.members;
}

export async function removeMemberFromIncident(incidentId: string, userId: string) {
  const response = await apiClient<{ member: IncidentMember }>(`/incidents/${incidentId}/members/${userId}`, {
    method: "DELETE",
  });
  return response.member;
}
