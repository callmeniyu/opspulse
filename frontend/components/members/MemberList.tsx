"use client";

import { useState, type FormEvent } from "react";
import { LoaderCircle, Plus, Edit, UserMinus, Users, X } from "lucide-react";

import { addMemberToIncident, findMemberCandidate, removeMemberFromIncident, updateMemberRole } from "@/api/member.api";
import type { IncidentMember, IncidentMemberRole } from "@/types/memberTypes";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { useToast } from "@/components/ui/ToastProvider";

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
  const [addOpen, setAddOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState<Candidate | null>(null);
  const [confirmMember, setConfirmMember] = useState<IncidentMember | null>(null);
  const [newRole, setNewRole] = useState<Extract<IncidentMemberRole, "RESPONDER" | "VIEWER">>("RESPONDER");
  const { showToast } = useToast();

  async function updateRole(member: Pick<IncidentMember, "id" | "name" | "email">, newRole: Extract<IncidentMemberRole, "RESPONDER" | "VIEWER">) {
    if (member.id === incidentOwnerId) return;
    setUpdatingUser({ id: member.id, name: member.name, email: member.email });
    try {
      await updateMemberRole(incidentId, member.id, newRole);
      showToast(`${member.name}'s role was updated.`, "success");
      await onMembersChanged();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to update member role.", "error");
    } finally {
      setUpdatingUser(null);
      setUpdateOpen(false);
    }
  }

  async function removeMember(member: IncidentMember) {
    if (member.id === incidentOwnerId) return;

    setRemovingId(member.id);

    try {
      await removeMemberFromIncident(incidentId, member.id);
      showToast(`${member.name} was removed.`, "success");
      await onMembersChanged();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to remove responder.", "error");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8b9cff]/10 text-[#aab7ff]">
              <Users size={15} />
            </span>
            <h2 className="text-sm font-semibold text-[#e9ebee]">Responders</h2>
          </div>
          <p className="mt-1 text-xs text-[#68717f]">{members.length} people have access</p>
        </div>

        {canManage && (
          <button type="button" onClick={() => setAddOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#343b46] px-3 py-2 text-xs font-medium text-[#dce0e5] hover:bg-[#1a202a]">
            <Plus size={14} />
            Add
          </button>
        )}
      </div>

      {members.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-[#343b46] px-4 py-8 text-center">
          <p className="text-sm text-[#aeb5bf]">No responders assigned</p>
          <p className="mt-1 text-xs text-[#68717f]">Add responders to coordinate the response.</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 2xl:grid-cols-1">
          {members.map((member) => {
            const owner = member.id === incidentOwnerId;
            const removing = removingId === member.id;

            return (
              <article key={member.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-[#252b35] bg-[#11151c] p-3">
                <Avatar name={member.name} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-[#dce0e5]">{member.name}</p>
                  </div>
                  <p className="truncate text-xs text-[#68717f]">{member.email}</p>
                  <RoleBadge role={member.role} />
                </div>

                <div className="flex gap-0">
                  {canManage && !owner && (
                    <button
                      type="button"
                      disabled={removing}
                      onClick={() => {
                        setUpdateOpen(true);
                        setUpdatingUser({ id: member.id, name: member.name, email: member.email });
                      }}
                      aria-label={`Remove ${member.name}`}
                      className="rounded-lg p-2 text-[#68717f] transition hover:bg-[#6ac263]/10 hover:text-[#6ac263] disabled:opacity-50"
                    >
                      {updateOpen ? <LoaderCircle size={15} className="animate-spin" /> : <Edit size={15} />}
                    </button>
                  )}

                  {canManage && !owner && (
                    <button type="button" disabled={removing} onClick={() => setConfirmMember(member)} aria-label={`Remove ${member.name}`} className="rounded-lg p-2 text-[#68717f] transition hover:bg-[#ff6262]/10 hover:text-[#ff8585] disabled:opacity-50">
                      {removing ? <LoaderCircle size={15} className="animate-spin" /> : <UserMinus size={15} />}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {addOpen && (
        <AddResponderDialog
          incidentId={incidentId}
          onClose={() => setAddOpen(false)}
          onAdded={async (name) => {
            showToast(`${name} was added to the incident.`, "success");
            await onMembersChanged();
            setAddOpen(false);
          }}
        />
      )}
      {confirmMember && (
        <ConfirmationDialog
          title="Remove responder?"
          message={`Remove ${confirmMember.name} from this incident? Their assigned incident tasks will become unassigned.`}
          confirmLabel="Remove"
          onCancel={() => setConfirmMember(null)}
          onConfirm={() => {
            const member = confirmMember;
            setConfirmMember(null);
            void removeMember(member);
          }}
        />
      )}

      {updateOpen && (
        //Create a custom dialogue box to update member role with an option to select between RESPONDER and VIEWER
        <div className="fixed inset-0 z-50 flex items-end bg-black/65 sm:items-center sm:justify-center sm:p-5">
          <div className="w-full rounded-t-2xl border border-[#343b46] bg-[#0e1117] p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#f1f3f5]">Update role</h3>
                <p className="mt-1 text-xs text-[#68717f]">Change the role of {updatingUser?.name}.</p>
              </div>
              <button type="button" onClick={() => setUpdateOpen(false)} className="rounded-lg p-2 text-[#8993a1] hover:bg-[#1a202a] hover:text-white">
                <X size={17} />
              </button>
            </div>
            <div className="mt-5">
              <label htmlFor="role" className="block text-sm font-medium text-[#f1f3f5]">
                Role
              </label>
              <select id="role" value={newRole} onChange={(e) => setNewRole(e.target.value as "RESPONDER" | "VIEWER")} className="mt-1 block w-full rounded-md border border-[#343b46] bg-[#0e1117] py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="RESPONDER">Responder</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setUpdateOpen(false);
                  setUpdatingUser(null);
                }}
                className="rounded-lg px-3 py-2 text-sm text-[#aeb5bf] hover:bg-[#1a202a]"
              >
                Cancel
              </button>
              <button type="button" onClick={() => updatingUser && void updateRole(updatingUser, newRole)} className="rounded-lg bg-blue-500 px-3 py-2 text-sm text-white hover:bg-blue-600">
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AddResponderDialog({ incidentId, onClose, onAdded }: { incidentId: string; onClose: () => void; onAdded: (name: string) => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"RESPONDER" | "VIEWER">("RESPONDER");
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [adding, setAdding] = useState(false);
  const { showToast } = useToast();

  async function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLookingUp(true);
    setCandidate(null);

    try {
      const user = await findMemberCandidate(incidentId, email.trim());
      setCandidate(user);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to find this user.", "error");
    } finally {
      setLookingUp(false);
    }
  }

  async function addResponder() {
    if (!candidate) return;

    setAdding(true);

    try {
      await addMemberToIncident(incidentId, { userId: candidate.id, role });
      await onAdded(candidate.name);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to add responder.", "error");
      setAdding(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/65 sm:items-center sm:justify-center sm:p-5">
      <div className="w-full rounded-t-2xl border border-[#343b46] bg-[#0e1117] p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#f1f3f5]">Add responder</h3>
            <p className="mt-1 text-xs text-[#68717f]">Search for a registered user by email.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-[#8993a1] hover:bg-[#1a202a] hover:text-white">
            <X size={17} />
          </button>
        </div>

        <form onSubmit={lookup} className="mt-5 flex gap-2">
          <input
            autoFocus
            type="email"
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setCandidate(null);
            }}
            placeholder="name@company.com"
            className="min-w-0 flex-1 rounded-lg border border-[#303744] bg-[#090b0f] px-3 py-2.5 text-sm text-[#e9ebee] outline-none placeholder:text-[#505865] focus:border-[#7185ff]"
          />
          <button type="submit" disabled={lookingUp} className="rounded-lg border border-[#343b46] px-3 text-xs font-medium text-[#dce0e5] hover:bg-[#1a202a] disabled:opacity-50">
            {lookingUp ? <LoaderCircle size={15} className="animate-spin" /> : "Find"}
          </button>
        </form>

        {candidate && (
          <div className="mt-4 rounded-xl border border-[#303744] bg-[#11151c] p-4">
            <div className="flex items-center gap-3">
              <Avatar name={candidate.name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#dce0e5]">{candidate.name}</p>
                <p className="truncate text-xs text-[#68717f]">{candidate.email}</p>
              </div>
            </div>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs font-medium text-[#aeb5bf]">Incident role</span>
              <select value={role} onChange={(event) => setRole(event.target.value as "RESPONDER" | "VIEWER")} className="w-full rounded-lg border border-[#303744] bg-[#090b0f] px-3 py-2.5 text-sm text-[#e9ebee] outline-none focus:border-[#7185ff]">
                <option value="RESPONDER">Responder — can work on tasks</option>
                <option value="VIEWER">Viewer — read-only access</option>
              </select>
            </label>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setCandidate(null)} disabled={adding} className="rounded-lg px-3 py-2 text-sm text-[#aeb5bf] hover:bg-[#1a202a]">
                Back
              </button>
              <button type="button" onClick={() => void addResponder()} disabled={adding} className="inline-flex items-center gap-2 rounded-lg bg-[#f1f3f5] px-3.5 py-2 text-sm font-semibold text-[#090b0f] hover:bg-white disabled:opacity-50">
                {adding && <LoaderCircle size={14} className="animate-spin" />}
                {adding ? "Adding..." : "Add responder"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  return <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#252b35] text-xs font-semibold text-[#dce0e5]">{name.slice(0, 1).toUpperCase()}</span>;
}

function RoleBadge({ role }: { role: IncidentMember["role"] }) {
  const styles = {
    OWNER: "border-[#aab7ff]/35 bg-[#8b9cff]/10 text-[#aab7ff]",
    RESPONDER: "border-[#6fa9ff]/35 bg-[#6fa9ff]/10 text-[#6fa9ff]",
    VIEWER: "border-[#89929f]/35 bg-[#89929f]/10 text-[#aeb5bf]",
  };

  return <span className={`mt-1.5 inline-flex rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${styles[role]}`}>{role}</span>;
}
