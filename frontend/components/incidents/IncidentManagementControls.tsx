"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, CheckCircle2, ChevronDown, CircleDot, LoaderCircle, Pencil, SearchCheck, ShieldCheck, X } from "lucide-react";

import { changeIncidentStatus, updateIncident } from "@/api/incident.api";
import type { Incident, IncidentSeverity, IncidentStatus } from "@/types/incidentTypes";

interface Props {
  incident: Incident;
  canEditDetails: boolean;
  canChangeStatus: boolean;
  onIncidentChanged: () => Promise<void>;
}

const statuses: { value: IncidentStatus; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "INVESTIGATING", label: "Investigating" },
  { value: "MITIGATED", label: "Mitigated" },
  { value: "RESOLVED", label: "Resolved" },
];

const statusMeta: Record<IncidentStatus, { description: string; dot: string; icon: typeof CircleDot }> = {
  OPEN: { description: "Reported and awaiting triage", dot: "bg-[#6fa9ff]", icon: CircleDot },
  INVESTIGATING: { description: "Team is actively investigating", dot: "bg-[#e7b65d]", icon: SearchCheck },
  MITIGATED: { description: "Impact contained; monitoring", dot: "bg-[#54c89b]", icon: ShieldCheck },
  RESOLVED: { description: "Response work is complete", dot: "bg-[#89929f]", icon: CheckCircle2 },
};

const severityOptions: { value: IncidentSeverity; description: string; tone: string }[] = [
  { value: "SEV1", description: "Critical impact", tone: "border-[#ff6262]/50 bg-[#ff6262]/10 text-[#ff8585]" },
  { value: "SEV2", description: "Major impact", tone: "border-[#e7b65d]/50 bg-[#e7b65d]/10 text-[#e7b65d]" },
  { value: "SEV3", description: "Moderate impact", tone: "border-[#6fa9ff]/50 bg-[#6fa9ff]/10 text-[#6fa9ff]" },
  { value: "SEV4", description: "Minor impact", tone: "border-[#89929f]/50 bg-[#89929f]/10 text-[#aeb5bf]" },
];

export function IncidentManagementControls({ incident, canEditDetails, canChangeStatus, onIncidentChanged }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function changeStatus(status: IncidentStatus) {
    if (status === incident.status) return;

    if (status === "RESOLVED" && !window.confirm("Resolve this incident? You can later reopen it by changing the status.")) {
      return;
    }

    setChangingStatus(true);
    setError(null);

    try {
      await changeIncidentStatus(incident.id, status);
      await onIncidentChanged();
      setStatusMenuOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to change incident status.");
    } finally {
      setChangingStatus(false);
    }
  }

  return (
    <>
      <div className="flex shrink-0 flex-wrap items-center gap-1 rounded-xl border border-[#303744] bg-[#090b0f]/75 p-1.5 shadow-sm">
        {canEditDetails && (
          <button type="button" onClick={() => setEditOpen(true)} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[#aeb5bf] transition hover:bg-[#1a202a] hover:text-[#f1f3f5]">
            <Pencil size={14} />
            Edit details
          </button>
        )}

        {canChangeStatus && (
          <div className="relative">
            <button type="button" disabled={changingStatus} onClick={() => setStatusMenuOpen((open) => !open)} aria-haspopup="menu" aria-expanded={statusMenuOpen} className="inline-flex items-center gap-2 rounded-lg bg-[#1a202a] px-3 py-2 text-xs font-medium text-[#f1f3f5] transition hover:bg-[#252b35] disabled:opacity-50">
              <span className={`h-2 w-2 rounded-full ${statusMeta[incident.status].dot}`} />
              {changingStatus ? "Updating..." : statuses.find((status) => status.value === incident.status)?.label}
              <ChevronDown size={14} className={`text-[#8993a1] transition-transform ${statusMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {statusMenuOpen && (
              <div role="menu" className="absolute right-0 top-[calc(100%+8px)] z-30 w-48 overflow-hidden rounded-xl border border-[#343b46] bg-[#11151c] p-1.5 shadow-2xl shadow-black/40">
                <p className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#68717f]">Set incident status</p>
                {statuses.map((status) => {
                  const meta = statusMeta[status.value];
                  const Icon = meta.icon;
                  const active = status.value === incident.status;

                  return (
                    <button key={status.value} type="button" role="menuitem" disabled={active || changingStatus} onClick={() => void changeStatus(status.value)} className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition ${active ? "cursor-default bg-[#252b35]" : "hover:bg-[#1a202a]"}`}>
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${active ? "bg-[#343b46]" : "bg-[#0e1117]"}`}>
                        <Icon size={14} className={active ? "text-[#f1f3f5]" : "text-[#8993a1]"} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-xs font-medium text-[#e9ebee]">
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                          {status.label}
                        </span>
                      </span>
                      {active && <Check size={14} className="text-[#aab7ff]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="mt-3 text-xs text-[#ff8585]">{error}</p>}

      {editOpen && (
        <EditIncidentDialog
          incident={incident}
          onClose={() => setEditOpen(false)}
          onSaved={async () => {
            await onIncidentChanged();
            setEditOpen(false);
          }}
        />
      )}
    </>
  );
}

function EditIncidentDialog({ incident, onClose, onSaved }: { incident: Incident; onClose: () => void; onSaved: () => Promise<void> }) {
  const [title, setTitle] = useState(incident.title);
  const [description, setDescription] = useState(incident.description ?? "");
  const [severity, setSeverity] = useState<IncidentSeverity>(incident.severity);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(incident.title);
    setDescription(incident.description ?? "");
    setSeverity(incident.severity);
  }, [incident]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (title.trim().length < 3) {
      setError("The incident title must contain at least 3 characters.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateIncident(incident.id, {
        title: title.trim(),
        description: description.trim() || null,
        severity,
      });

      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update incident.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/65 sm:items-center sm:justify-center sm:p-5">
      <form onSubmit={save} className="w-full rounded-t-2xl border border-[#343b46] bg-[#0e1117] p-5 shadow-2xl sm:max-w-xl sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#f1f3f5]">Edit incident</h3>
            <p className="mt-1 text-xs text-[#68717f]">Update the shared incident context.</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg p-2 text-[#8993a1] hover:bg-[#1a202a] hover:text-white">
            <X size={17} />
          </button>
        </div>

        {error && <p className="mt-4 rounded-lg border border-[#ff6262]/20 bg-[#ff6262]/5 px-3 py-2 text-xs text-[#ff8585]">{error}</p>}

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[#aeb5bf]">Title</span>
            <input required minLength={3} maxLength={255} value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-lg border border-[#303744] bg-[#090b0f] px-3 py-2.5 text-sm text-[#e9ebee] outline-none focus:border-[#7185ff]" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[#aeb5bf]">Description</span>
            <textarea rows={5} maxLength={5000} value={description} onChange={(event) => setDescription(event.target.value)} className="w-full resize-none rounded-lg border border-[#303744] bg-[#090b0f] px-3 py-2.5 text-sm text-[#e9ebee] outline-none focus:border-[#7185ff]" />
          </label>

          <fieldset>
            <legend className="mb-1.5 text-xs font-medium text-[#aeb5bf]">Severity</legend>
            <div className="grid grid-cols-2 gap-2">
              {severityOptions.map((option) => {
                const selected = severity === option.value;

                return (
                  <button key={option.value} type="button" onClick={() => setSeverity(option.value)} className={`rounded-lg border px-3 py-2.5 text-left transition ${selected ? option.tone : "border-[#303744] bg-[#090b0f] text-[#8993a1] hover:border-[#505865]"}`}>
                    <span className="flex items-center justify-between gap-2 text-xs font-semibold">
                      {option.value}
                      {selected && <Check size={14} />}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-normal opacity-80">{option.description}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" disabled={saving} onClick={onClose} className="rounded-lg px-3 py-2 text-sm text-[#aeb5bf] hover:bg-[#1a202a]">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#f1f3f5] px-3.5 py-2 text-sm font-semibold text-[#090b0f] hover:bg-white disabled:opacity-50">
            {saving && <LoaderCircle size={14} className="animate-spin" />}
            <Check size={14} />
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
