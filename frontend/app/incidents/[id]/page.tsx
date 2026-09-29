"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";

import { IncidentStatusBadge } from "@/components/incidents/IncidentStatusBadge";
import { SeverityBadge } from "@/components/incidents/SeverityBadge";
import { IncidentTimeline } from "@/components/incidents/IncidentTimeline";

import { MemberList } from "@/components/members/MemberList";
import { TaskList } from "@/components/tasks/TaskList";
import { Loading } from "@/components/ui/Loading";

import { getIncidentById } from "@/api/incident.api";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setLoading, setSelectedIncident, setIncidentMembers } from "@/store/slices/incidentSlice";
import type { Incident } from "@/types/incidentTypes";
import type { IncidentMember } from "@/types/memberTypes";
import type { Task } from "@/types/taskTypes";
import { getMembersByIncidentId } from "@/api/member.api";
import { getTasksByIncidentId } from "@/api/tasks.api";

export default function IncidentDetailsPage() {
  const params = useParams();

  const id = params.id as string;

  const dispatch = useAppDispatch();

  const { loading, selectedIncident: incident, selectedIncidentMembers: members } = useAppSelector((state) => state.incidents);

  const [tasks, setTasks] = useState<Task[]>([]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      dispatch(setLoading(true));
      try {
        const [incidentResponse, memberResponse, taskResponse] = await Promise.all([getIncidentById(id), getMembersByIncidentId(id), getTasksByIncidentId(id)]);

        dispatch(setSelectedIncident(incidentResponse.incident));

        dispatch(setIncidentMembers(memberResponse));

        setTasks(taskResponse);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unable to load incident details");
      } finally {
        dispatch(setLoading(false));
      }
    }

    load();
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <div className="p-8">
          <Loading label="Loading incident" />
        </div>
      </AppShell>
    );
  }

  if (!incident) {
    return (
      <AppShell>
        <div className="p-8 text-sm text-[#9ca4b1]">Incident not found.</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] p-5 sm:p-8">
        <div className="mb-7">
          <a href="/incidents" className="text-xs text-[#68717f] hover:text-[#dce0e5]">
            ← Incidents
          </a>
        </div>

        <div className="mb-8 flex flex-col gap-5 border-b border-[#1b2028] pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <SeverityBadge severity={incident.severity} />

              <IncidentStatusBadge status={incident.status} />
            </div>

            <h1 className="max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl">{incident.title}</h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68717f]">{incident.description ?? "No description provided."}</p>
          </div>

          <div className="text-left lg:text-right">
            <p className="text-xs uppercase tracking-wider text-[#505865]">Started</p>

            <p className="mt-1 text-sm text-[#9ca4b1]">{new Date(incident.created_at).toLocaleString()}</p>
          </div>
        </div>

        {error && <div className="rounded-lg border border-[#ff6262]/20 bg-[#ff6262]/5 px-3 py-2.5 text-sm text-[#ff7b7b]">{error}</div>}

        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <section className="rounded-xl border border-[#252b35] bg-[#0e1117] p-5">
            <IncidentTimeline />
          </section>

          <div className="space-y-5">
            <section className="rounded-xl border border-[#252b35] bg-[#0e1117] p-5">
              <MemberList members={members} />
            </section>

            <section className="rounded-xl border border-[#252b35] bg-[#0e1117] p-5">
              <TaskList tasks={tasks} />
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
