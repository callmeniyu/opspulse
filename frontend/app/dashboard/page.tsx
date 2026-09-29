"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { IncidentRow } from "@/components/incidents/IncidentRow";
import { Loading } from "@/components/ui/Loading";

import type { Incident } from "@/types/incidentTypes";
import { Task } from "@/types/taskTypes";
import { getIncidents } from "@/api/incident.api";
import { setLoading, setIncidents } from "@/store/slices/incidentSlice";
import { useAppSelector } from "@/store/hooks";
import { useAppDispatch } from "@/store/hooks";

export default function DashboardPage() {
  const { loading, items: incidents } = useAppSelector((state) => state.incidents);
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function load() {
      dispatch(setLoading(true));
      try {
        const response = await getIncidents();

        dispatch(setIncidents(response.incidents));
      } finally {
        dispatch(setLoading(false));
      }
    }

    load();
  }, []);

  const active = incidents.filter((incident) => incident.status !== "RESOLVED");

  const critical = incidents.filter((incident) => incident.severity === "SEV1" && incident.status !== "RESOLVED");

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] p-5 sm:p-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[#68717f]">Operations overview</p>

            <h1 className="text-2xl font-semibold tracking-tight">Good afternoon, Nick.</h1>

            <p className="mt-1 text-sm text-[#68717f]">Here&apos;s what&apos;s happening across your incidents.</p>
          </div>

          <Link href="/incidents/new" className="hidden rounded-lg bg-[#f1f3f5] px-4 py-2.5 text-sm font-medium text-[#090b0f] hover:bg-white sm:block">
            + Create incident
          </Link>
        </div>

        <div className="mb-8 grid grid-cols-2 border-y border-[#1b2028] sm:grid-cols-4">
          <Metric label="Active" value={active.length} />

          <Metric label="Critical" value={critical.length} danger={critical.length > 0} />

          <Metric label="Tasks" value="07" />

          <Metric label="SLA" value="92%" />
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Active incidents</h2>

              <p className="mt-1 text-xs text-[#505865]">Current operational events</p>
            </div>

            <Link href="/incidents" className="text-xs font-medium text-[#8b9cff] hover:text-[#a4b0ff]">
              View all →
            </Link>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#252b35] bg-[#0e1117]">
            {loading ? (
              <div className="p-6">
                <Loading />
              </div>
            ) : active.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm text-[#9ca4b1]">No active incidents.</p>

                <p className="mt-1 text-xs text-[#505865]">Your systems are currently quiet.</p>
              </div>
            ) : (
              active.slice(0, 5).map((incident) => <IncidentRow key={incident.id} incident={incident} />)
            )}
          </div>
        </section>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <section className="rounded-xl border border-[#252b35] bg-[#0e1117] p-5">
            <h2 className="text-sm font-semibold">Response activity</h2>

            <div className="mt-8 flex h-32 items-end gap-2">
              {[35, 50, 42, 70, 54, 82, 61, 45, 67, 90, 73, 58].map((height, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-sm bg-[#252b35]"
                  style={{
                    height: `${height}%`,
                  }}
                />
              ))}
            </div>

            <div className="mt-3 flex justify-between text-[10px] uppercase tracking-wider text-[#505865]">
              <span>12 hours ago</span>
              <span>Now</span>
            </div>
          </section>

          <section className="rounded-xl border border-[#252b35] bg-[#0e1117] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">My tasks</h2>

              <span className="text-xs text-[#505865]">3 open</span>
            </div>

            <div className="mt-5 space-y-1">
              <TaskPreview text="Check payment API logs" />
              <TaskPreview text="Review latest deployment" />
              <TaskPreview text="Verify database metrics" />
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function Metric({ label, value, danger = false }: { label: string; value: string | number; danger?: boolean }) {
  return (
    <div className="border-r border-[#1b2028] px-4 py-5 last:border-r-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#505865]">{label}</p>

      <p className={`mt-2 text-2xl font-semibold ${danger ? "text-[#ff6262]" : "text-[#e9ebee]"}`}>{value}</p>
    </div>
  );
}

function TaskPreview({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-[#141820]">
      <span className="h-4 w-4 rounded border border-[#343b46]" />

      <span className="text-sm text-[#aeb5bf]">{text}</span>
    </div>
  );
}
