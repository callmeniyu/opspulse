"use client";

import { useState, type FormEvent } from "react";
import { Check, LoaderCircle, Plus, UserMinus, Users, X } from "lucide-react";

import { addMemberToIncident, findMemberCandidate, removeMemberFromIncident } from "@/api/member.api";
import type { IncidentMember, IncidentMemberRole } from "@/types/memberTypes";

interface MemberListProps {
  incidentId: string;
  members: IncidentMember[];
  incidentOwnerId: string;
  canManage: boolean;
  onMembersChanged: () => Promise<void>;
}

type Candidate = {
  id: string;
  name: string;
  email: string;
};

export function MemberList({ incidentId, members, incidentOwnerId, canManage, onMembersChanged }: MemberListProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"RESPONDER" | "VIEWER">("RESPONDER");
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setCandidate(null);

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setError("Enter the registered user's email address.");
      return;
    }

    setLookingUp(true);
    try {
      const result = await findMemberCandidate(incidentId, normalizedEmail);
      setCandidate(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to find this user.");
    } finally {
      setLookingUp(false);
    }
  }

  async function handleAdd() {
    if (!candidate) return;

    setError(null);
    setNotice(null);
    setAdding(true);

    try {
      await addMemberToIncident(incidentId, {
        userId: candidate.id,
        role,
      });

      setEmail("");
      setCandidate(null);
      setNotice(`${candidate.name} was added to this incident.`);
      await onMembersChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add this responder.");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(member: IncidentMember) {
    if (member.id === incidentOwnerId) {
      setError("The incident owner cannot be removed.");
      return;
    }

    const confirmed = window.confirm(`Remove ${member.name} from this incident? Any tasks assigned to this user will become unassigned if the database uses its configured SET NULL relationship.`);

    if (!confirmed) return;

    setError(null);
    setNotice(null);
    setRemovingId(member.id);

    try {
      await removeMemberFromIncident(incidentId, member.id);
      setNotice(`${member.name} was removed from this incident.`);
      await onMembersChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove this member.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Users size={16} className="mt-0.5 text-[#a4b0ff]" />
          <div>
            <h2 className="text-sm font-semibold text-[#e9ebee]">Responders</h2>
            <p className="mt-1 text-xs text-[#68717f]">People with access to this incident.</p>
          </div>
        </div>
        <span className="rounded-md border border-[#252b35] px-2 py-1 text-xs text-[#9ca4b1]">{members.length}</span>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-[#ff6262]/25 bg-[#ff6262]/5 px-3 py-2 text-xs leading-5 text-[#ff8585]">
          {error}
        </div>
      )}

      {notice && (
        <div role="status" className="rounded-lg border border-[#285a48] bg-[#102018] px-3 py-2 text-xs leading-5 text-[#80c6a9]">
          {notice}
        </div>
      )}

      {canManage && (
        <div className="rounded-lg border border-[#252b35] bg-[#10141b] p-3">
          <form onSubmit={handleLookup} className="space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-[#9ca4b1]">Add a registered user</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setCandidate(null);
                }}
                placeholder="name@example.com"
                className="w-full rounded-md border border-[#303744] bg-[#0b0e13] px-3 py-2 text-sm text-[#dce0e5] outline-none placeholder:text-[#505865] focus:border-[#7185ff]"
              />
            </label>

            <button type="submit" disabled={lookingUp || !email.trim()} className="inline-flex items-center gap-2 rounded-md border border-[#343b46] px-3 py-2 text-xs font-medium text-[#dce0e5] hover:bg-[#1a202a] disabled:opacity-50">
              {lookingUp ? <LoaderCircle size={14} className="animate-spin" /> : <Users size={14} />}
              {lookingUp ? "Looking up..." : "Find user"}
            </button>
          </form>

          {candidate && (
            <div className="mt-3 rounded-lg border border-[#343b46] bg-[#0b0e13] p-3">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#252b35] text-sm font-semibold text-[#dce0e5]">{candidate.name.slice(0, 1).toUpperCase()}</div>
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-medium text-[#dce0e5]">{candidate.name}</p>
                  <p className="break-all text-xs text-[#68717f]">{candidate.email}</p>
                </div>
              </div>

              <label className="mt-3 block">
                <span className="mb-1.5 block text-xs text-[#9ca4b1]">Incident role</span>
                <select value={role} onChange={(event) => setRole(event.target.value as "RESPONDER" | "VIEWER")} className="w-full rounded-md border border-[#303744] bg-[#10141b] px-3 py-2 text-sm text-[#dce0e5] outline-none focus:border-[#7185ff]">
                  <option value="RESPONDER">Responder — can work on tasks</option>
                  <option value="VIEWER">Viewer — read-only access</option>
                </select>
              </label>

              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => void handleAdd()} disabled={adding} className="inline-flex items-center gap-2 rounded-md bg-[#dce4ff] px-3 py-2 text-xs font-semibold text-[#111827] hover:bg-white disabled:opacity-50">
                  {adding ? <LoaderCircle size={14} className="animate-spin" /> : <Plus size={14} />}
                  {adding ? "Adding..." : "Add to incident"}
                </button>
                <button type="button" onClick={() => setCandidate(null)} disabled={adding} className="inline-flex items-center gap-2 rounded-md border border-[#343b46] px-3 py-2 text-xs text-[#9ca4b1] hover:bg-[#141820] disabled:opacity-50">
                  <X size={14} />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!canManage && <p className="rounded-lg border border-[#252b35] px-3 py-2 text-xs leading-5 text-[#68717f]">Only the incident owner can add or remove members.</p>}

      {members.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#303744] px-4 py-6 text-center">
          <p className="text-sm text-[#9ca4b1]">No members found.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#1b2028]">
          {members.map((member) => {
            const isOwner = member.id === incidentOwnerId;
            const isRemoving = removingId === member.id;

            return (
              <div key={member.id} className="flex items-center gap-3 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#343b46] bg-[#1a202a] text-xs font-semibold text-[#dce0e5]">{member.name.slice(0, 1).toUpperCase()}</div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm text-[#dce0e5]">{member.name}</p>
                    {isOwner && <span className="rounded border border-[#343b46] px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-[#a4b0ff]">Owner</span>}
                  </div>
                  <p className="truncate text-xs text-[#68717f]">{member.email}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-[#8993a1]">{member.role}</p>
                </div>

                {canManage && !isOwner && (
                  <button type="button" disabled={isRemoving || removingId !== null} onClick={() => void handleRemove(member)} aria-label={`Remove ${member.name}`} title="Remove from incident" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#68717f] hover:bg-[#ff6262]/10 hover:text-[#ff8585] disabled:opacity-50">
                    {isRemoving ? <LoaderCircle size={15} className="animate-spin" /> : <UserMinus size={15} />}
                  </button>
                )}

                {isOwner && <span className="text-[10px] text-[#68717f]">Protected</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
