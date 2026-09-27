"use client";

import Link from "next/link";

import type { Incident } from "@/types/incidentTypes";

import { SeverityBadge } from "./SeverityBadge";
import { IncidentStatusBadge } from "./IncidentStatusBadge";

export function IncidentRow({ incident }: { incident: Incident }) {
  const createdAt = new Date(incident.created_at);

  return (
    <Link href={`/incidents/${incident.id}`} className="group block border-b border-[#1b2028] px-5 py-4 transition hover:bg-[#0f1319]">
      <div className="flex items-center gap-4">
        <SeverityBadge severity={incident.severity} />

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-[#e9ebee] group-hover:text-white">{incident.title}</div>

          <div className="mt-1 truncate text-xs text-[#68717f]">
            {incident.creator_name ?? "Unknown creator"} ·{" "}
            {createdAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        <IncidentStatusBadge status={incident.status} />

        <span className="hidden text-xs text-[#505865] sm:block">→</span>
      </div>
    </Link>
  );
}
