"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, ChevronDown, Pencil, X } from "lucide-react";

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

const severities: IncidentSeverity[] = ["SEV1", "SEV2", "SEV3", "SEV4"];

export function IncidentManagementControls({ incident, canEditDetails, canChangeStatus, onIncidentChanged }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(incident.title);
  const [description, setDescription] = useState(incident.description ?? "");
  const [severity, setSeverity] = useState<IncidentSeverity>(incident.severity);
  const [saving, setSaving] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setTitle(incident.title);
    setDescription(incident.description ?? "");
    setSeverity(incident.severity);
  }, [incident.title, incident.description, incident.severity]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (title.trim().length < 3) {
      setError("The incident title must contain at least 3 characters.");
      return;
    }

    setSaving(true);

    try {
      await updateIncident(incident.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        severity,
      });

      setEditing(false);
      setNotice("Incident details updated.");
      await onIncidentChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update incident details.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(nextStatus: IncidentStatus) {
    if (nextStatus === incident.status) return;

    if (nextStatus === "RESOLVED" && !window.confirm("Resolve this incident? You can reopen it later by changing its status.")) {
      return;
    }

    setError(null);
    setNotice(null);
    setChangingStatus(true);

    try {
      await changeIncidentStatus(incident.id, nextStatus);
      setNotice(`Incident status changed to ${nextStatus.replace("_", " ")}.`);
      await onIncidentChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to change incident status.");
    } finally {
      setChangingStatus(false);
    }
  }

  return (
    <div className="w-full space-y-3 xl:w-auto xl:min-w-[230px]">
      {(error || notice) && (
        <p role={error ? "alert" : "status"} className={`rounded-lg border px-3 py-2 text-xs leading-5 ${error ? "border-[#ff6262]/25 bg-[#ff6262]/5 text-[#ff8585]" : "border-[#285a48] bg-[#102018] text-[#80c6a9]"}`}>
          {error ?? notice}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 xl:justify-end">
        {canEditDetails && (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setNotice(null);
              setEditing((current) => !current);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-[#343b46] px-3 py-2 text-xs font-medium text-[#dce0e5] hover:bg-[#141820]"
          >
            {editing ? <X size={14} /> : <Pencil size={14} />}
            {editing ? "Close editor" : "Edit incident"}
          </button>
        )}

        {canChangeStatus && (
          <label className="relative">
            <span className="sr-only">Change incident status</span>
            <select value={incident.status} disabled={changingStatus} onChange={(event) => void handleStatusChange(event.target.value as IncidentStatus)} className="appearance-none rounded-lg border border-[#343b46] bg-[#10141b] py-2 pl-3 pr-8 text-xs font-medium text-[#dce0e5] outline-none focus:border-[#7185ff] disabled:opacity-50">
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8993a1]" />
          </label>
        )}
      </div>

      {editing && canEditDetails && (
        <form onSubmit={handleSave} className="rounded-xl border border-[#343b46] bg-[#10141b] p-4 text-left">
          <h3 className="mb-4 text-sm font-semibold text-[#e9ebee]">Edit incident details</h3>

          <label className="mb-3 block">
            <span className="mb-1.5 block text-xs text-[#9ca4b1]">Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} required minLength={3} maxLength={255} className="w-full rounded-md border border-[#303744] bg-[#0b0e13] px-3 py-2 text-sm text-[#dce0e5] outline-none focus:border-[#7185ff]" />
          </label>

          <label className="mb-3 block">
            <span className="mb-1.5 block text-xs text-[#9ca4b1]">Description</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={5000} rows={4} placeholder="Describe the impact and relevant context" className="w-full resize-y rounded-md border border-[#303744] bg-[#0b0e13] px-3 py-2 text-sm text-[#dce0e5] outline-none focus:border-[#7185ff]" />
          </label>

          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs text-[#9ca4b1]">Severity</span>
            <select value={severity} onChange={(event) => setSeverity(event.target.value as IncidentSeverity)} className="w-full rounded-md border border-[#303744] bg-[#0b0e13] px-3 py-2 text-sm text-[#dce0e5] outline-none focus:border-[#7185ff]">
              {severities.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-[#dce4ff] px-3 py-2 text-xs font-semibold text-[#111827] hover:bg-white disabled:opacity-50">
              <Check size={14} />
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setTitle(incident.title);
                setDescription(incident.description ?? "");
                setSeverity(incident.severity);
                setEditing(false);
              }}
              className="rounded-md border border-[#343b46] px-3 py-2 text-xs text-[#9ca4b1] hover:bg-[#141820] disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
