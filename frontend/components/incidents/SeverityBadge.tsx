import type { IncidentSeverity } from "@/types/incidentTypes";

export function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  const styles = {
    SEV1: "text-[#ff6b6b] bg-[#ff6262]/10 border-[#ff6262]/20",
    SEV2: "text-[#e7b65d] bg-[#e7b65d]/10 border-[#e7b65d]/20",
    SEV3: "text-[#6fa9ff] bg-[#6fa9ff]/10 border-[#6fa9ff]/20",
    SEV4: "text-[#89929f] bg-[#89929f]/10 border-[#89929f]/20",
  };

  return (
    <span
      className={`
        inline-flex items-center
        rounded-md border px-2 py-1
        text-[10px] font-bold tracking-wider
        ${styles[severity]}
      `}
    >
      {severity}
    </span>
  );
}
