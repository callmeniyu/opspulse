import type { IncidentSeverity, IncidentStatus } from "@/types/incidentTypes";
import { IncidentStatusBadge } from "@/components/incidents/IncidentStatusBadge";
import { SeverityBadge } from "@/components/incidents/SeverityBadge";

export function IncidentMeta({ title, severity, status }: { title: string; severity: IncidentSeverity; status: IncidentStatus }) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <SeverityBadge severity={severity} />
        <IncidentStatusBadge status={status} />
      </div>
      <p className="truncate text-sm font-medium text-[#dce0e5]">{title}</p>
    </div>
  );
}
