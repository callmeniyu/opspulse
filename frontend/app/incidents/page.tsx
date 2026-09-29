"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { IncidentRow } from "@/components/incidents/IncidentRow";
import { Loading } from "@/components/ui/Loading";

import type { IncidentSeverity, IncidentStatus } from "@/types/incidentTypes";
import { getIncidents } from "@/api/incident.api";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setLoading, setIncidents } from "@/store/slices/incidentSlice";

export default function IncidentsPage() {
  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<IncidentStatus | "ALL">("ALL");

  const [severity, setSeverity] = useState<IncidentSeverity | "ALL">("ALL");

  const dispatch = useAppDispatch();
  const { items: incidents, loading } = useAppSelector((state) => state.incidents);

  useEffect(() => {
    async function load() {
      dispatch(setLoading(true));

      try {
        const response = await getIncidents();
        dispatch(setIncidents(response.incidents));
      } catch (error) {
        console.error("Error fetching incidents:", error);
      } finally {
        dispatch(setLoading(false));
      }
    }

    load();
  }, []);

  const filtered = incidents.filter((incident) => {
    const matchesSearch = incident.title.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = status === "ALL" || incident.status === status;

    const matchesSeverity = severity === "ALL" || incident.severity === severity;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] p-5 sm:p-8">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[#68717f]">Operations</p>

            <h1 className="text-2xl font-semibold">Incidents</h1>

            <p className="mt-1 text-sm text-[#68717f]">Monitor and coordinate active operational events.</p>
          </div>

          <Link href="/incidents/new" className="rounded-lg bg-[#f1f3f5] px-4 py-2.5 text-sm font-medium text-[#090b0f] hover:bg-white">
            + Create incident
          </Link>
        </div>

        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search incidents..." className="h-10 flex-1 rounded-lg border border-[#252b35] bg-[#0e1117] px-3 text-sm text-[#dce0e5] outline-none placeholder:text-[#505865] focus:border-[#343c4a]" />

          <select value={status} onChange={(event) => setStatus(event.target.value as IncidentStatus | "ALL")} className="h-10 rounded-lg border border-[#252b35] bg-[#0e1117] px-3 text-sm text-[#9ca4b1] outline-none">
            <option value="ALL">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="MITIGATED">Mitigated</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select value={severity} onChange={(event) => setSeverity(event.target.value as IncidentSeverity | "ALL")} className="h-10 rounded-lg border border-[#252b35] bg-[#0e1117] px-3 text-sm text-[#9ca4b1] outline-none">
            <option value="ALL">All severities</option>
            <option value="SEV1">SEV1</option>
            <option value="SEV2">SEV2</option>
            <option value="SEV3">SEV3</option>
            <option value="SEV4">SEV4</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#252b35] bg-[#0e1117]">
          <div className="hidden border-b border-[#1b2028] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#505865] sm:block">{filtered.length} incidents</div>

          {loading ? (
            <div className="p-6">
              <Loading />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-14 text-center">
              <p className="text-sm text-[#9ca4b1]">No incidents found.</p>

              <p className="mt-1 text-xs text-[#505865]">Try adjusting your filters.</p>
            </div>
          ) : (
            filtered.map((incident) => <IncidentRow key={incident.id} incident={incident} />)
          )}
        </div>
      </div>
    </AppShell>
  );
}
