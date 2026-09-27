import type { IncidentStatus } from "@/types/incidentTypes";

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  const styles = {
    OPEN: "text-[#6fa9ff] bg-[#6fa9ff]/10",
    INVESTIGATING: "text-[#e7b65d] bg-[#e7b65d]/10",
    MITIGATED: "text-[#54c89b] bg-[#54c89b]/10",
    RESOLVED: "text-[#89929f] bg-[#89929f]/10",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-md px-2 py-1
        text-[10px] font-semibold tracking-wide
        ${styles[status]}
      `}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {status}
    </span>
  );
}
