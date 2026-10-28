"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Check, CircleAlert, RefreshCw, Users } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { IncidentMeta } from "@/components/incidents/IncidentMeta";
import { Loading } from "@/components/ui/Loading";
import { getMyTeams } from "@/api/personalWork.api";
import type { MyTeam } from "@/types/personalWorkTypes";
import type { IncidentStatus } from "@/types/incidentTypes";

type StatusFilter = "ACTIVE" | "ALL" | "RESOLVED";

export default function MyTeamsPage() {
  const [teams, setTeams] = useState<MyTeam[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("ACTIVE");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTeams() {
    setLoading(true);
    setError(null);
    try {
      setTeams(await getMyTeams());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load your teams.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTeams();
  }, []);

  const activeCount = teams.filter((team) => team.incident_status !== "RESOLVED").length;

  const resolvedCount = teams.length - activeCount;

  const visibleTeams = useMemo(() => {
    if (filter === "ACTIVE") {
      return teams.filter((team) => team.incident_status !== "RESOLVED");
    }
    if (filter === "RESOLVED") {
      return teams.filter((team) => team.incident_status === "RESOLVED");
    }
    return teams;
  }, [teams, filter]);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] p-5 sm:p-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[#68717f]">Collaboration</p>
            <h1 className="text-2xl font-semibold tracking-tight">My teams</h1>
            <p className="mt-1 text-sm text-[#68717f]">Incident response teams you belong to.</p>
          </div>

          <button onClick={() => void loadTeams()} disabled={loading} className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-[#252b35] px-3 py-2 text-sm text-[#aeb5bf] transition hover:bg-[#141820] disabled:opacity-50 sm:self-auto">
            <RefreshCw size={14} />
            Refresh
          </button>
        </header>

        <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#252b35] bg-[#252b35] sm:grid-cols-3">
          <Stat label="Total teams" value={teams.length} />
          <Stat label="Active incidents" value={activeCount} />
          <Stat label="Resolved" value={resolvedCount} />
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {(
            [
              ["ACTIVE", "Active"],
              ["ALL", "All teams"],
              ["RESOLVED", "Resolved"],
            ] as const
          ).map(([value, label]) => (
            <button key={value} onClick={() => setFilter(value)} className={`rounded-lg px-3 py-2 text-xs font-medium transition ${filter === value ? "bg-[#e8ebef] text-[#090b0f]" : "border border-[#252b35] text-[#8993a1] hover:bg-[#141820] hover:text-[#dce0e5]"}`}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-xl border border-[#252b35] bg-[#0e1117] p-8">
            <Loading label="Loading your teams" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-[#74383d] bg-[#190f12] p-5">
            <p className="text-sm text-[#ff8585]">{error}</p>
            <button onClick={() => void loadTeams()} className="mt-3 text-sm text-[#dce0e5] underline underline-offset-4">
              Try again
            </button>
          </div>
        ) : visibleTeams.length === 0 ? (
          <div className="rounded-xl border border-[#252b35] bg-[#0e1117] px-5 py-14 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[#252b35] bg-[#141820]">
              <Users size={18} className="text-[#8993a1]" />
            </div>
            <h2 className="text-sm font-semibold text-[#dce0e5]">{teams.length === 0 ? "You are not part of any teams yet" : "No teams in this view"}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-[#68717f]">{teams.length === 0 ? "When you create an incident or are added as a responder, it will appear here." : "Choose another filter to view your incident teams."}</p>
            {teams.length === 0 && (
              <Link href="/incidents/new" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#a4b0ff] hover:text-[#c0c8ff]">
                Create an incident <ArrowUpRight size={14} />
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {visibleTeams.map((team) => (
              <Link key={team.incident_id} href={`/incidents/${team.incident_id}`} className="group rounded-xl border border-[#252b35] bg-[#0e1117] p-5 transition hover:border-[#394251] hover:bg-[#11151c]">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <IncidentMeta title={team.incident_title} severity={team.incident_severity} status={team.incident_status} />
                  <ArrowUpRight size={16} className="shrink-0 text-[#505865] transition group-hover:text-[#dce0e5]" />
                </div>

                {team.incident_description && <p className="mb-5 line-clamp-2 text-sm leading-6 text-[#68717f]">{team.incident_description}</p>}

                <div className="grid grid-cols-2 gap-3 border-y border-[#252b35] py-4 sm:grid-cols-3">
                  <Detail icon={<Users size={14} />} label="Responders" value={team.member_count} />
                  <Detail icon={<CircleAlert size={14} />} label="Open tasks" value={team.open_task_count} />
                  <div className="col-span-2 sm:col-span-1">
                    <p className="mb-1 text-[10px] uppercase tracking-wider text-[#505865]">Your role</p>
                    <p className="text-xs font-medium text-[#c4cbd5]">{formatRole(team.current_user_role)}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs text-[#68717f]">Joined {new Date(team.joined_at).toLocaleDateString()}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#8993a1]">
                    Open incident <ArrowUpRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#0e1117] px-4 py-5 sm:px-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#68717f]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-[#e9ebee]">{value}</p>
    </div>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#505865]">
        {icon}
        {label}
      </p>
      <p className="text-lg font-semibold tabular-nums text-[#dce0e5]">{value}</p>
    </div>
  );
}

function formatRole(role: string) {
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
