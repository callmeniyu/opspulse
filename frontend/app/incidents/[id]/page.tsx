"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Activity, ArrowLeft, CheckCircle2, Clock3, ListTodo, MessageSquare, RefreshCw, ShieldAlert, Users } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { IncidentStatusBadge } from "@/components/incidents/IncidentStatusBadge";
import { SeverityBadge } from "@/components/incidents/SeverityBadge";
import { IncidentManagementControls } from "@/components/incidents/IncidentManagementControls";
import { TaskList } from "@/components/tasks/TaskList";
import { MemberList } from "@/components/members/MemberList";
import { Loading } from "@/components/ui/Loading";

import { getIncidentById } from "@/api/incident.api";
import { getMembersByIncidentId } from "@/api/member.api";
import { getTasksByIncidentId } from "@/api/tasks.api";

import type { Incident } from "@/types/incidentTypes";
import type { IncidentMember } from "@/types/memberTypes";
import type { Task } from "@/types/taskTypes";

type WorkspaceTab = "activity" | "conversation";

export default function IncidentDetailsPage() {
  const params = useParams<{ id: string }>();
  const incidentId = params.id;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [members, setMembers] = useState<IncidentMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("activity");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [incidentError, setIncidentError] = useState<string | null>(null);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [tasksError, setTasksError] = useState<string | null>(null);

  async function loadWorkspace(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setIncidentError(null);
    setMembersError(null);
    setTasksError(null);

    try {
      const result = await getIncidentById(incidentId);
      setIncident(result.incident);
    } catch (error) {
      setIncident(null);
      setIncidentError(error instanceof Error ? error.message : "Unable to load this incident.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const [membersResult, tasksResult] = await Promise.allSettled([getMembersByIncidentId(incidentId), getTasksByIncidentId(incidentId)]);

    if (membersResult.status === "fulfilled") {
      setMembers(membersResult.value);
    } else {
      setMembersError("Responders could not be loaded.");
    }

    if (tasksResult.status === "fulfilled") {
      setTasks(tasksResult.value);
    } else {
      setTasksError("Response tasks could not be loaded.");
    }

    setLoading(false);
    setRefreshing(false);
  }

  async function refreshTasks() {
    const updatedTasks = await getTasksByIncidentId(incidentId);
    setTasks(updatedTasks);
    setTasksError(null);
  }

  async function refreshMembersAndTasks() {
    const [membersResult, tasksResult] = await Promise.allSettled([getMembersByIncidentId(incidentId), getTasksByIncidentId(incidentId)]);

    if (membersResult.status === "fulfilled") {
      setMembers(membersResult.value);
      setMembersError(null);
    }

    if (tasksResult.status === "fulfilled") {
      setTasks(tasksResult.value);
      setTasksError(null);
    }
  }

  useEffect(() => {
    void loadWorkspace();
  }, [incidentId]);

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto flex min-h-[65vh] max-w-[1450px] items-center justify-center p-6">
          <Loading label="Loading incident workspace" />
        </div>
      </AppShell>
    );
  }

  if (!incident) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl p-6 sm:p-8">
          <Link href="/incidents" className="mb-6 inline-flex items-center gap-2 text-sm text-[#8993a1] hover:text-[#dce0e5]">
            <ArrowLeft size={15} />
            All incidents
          </Link>

          <div className="rounded-2xl border border-[#252b35] bg-[#0e1117] p-6">
            <ShieldAlert size={22} className="mb-4 text-[#ff8585]" />
            <h1 className="text-lg font-semibold text-[#f1f3f5]">Unable to open incident</h1>
            <p className="mt-2 text-sm text-[#8993a1]">{incidentError ?? "This incident could not be found."}</p>

            <button onClick={() => void loadWorkspace()} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#f1f3f5] px-3.5 py-2 text-sm font-medium text-[#090b0f] hover:bg-white">
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  const completedTasks = tasks.filter((task) => task.status === "COMPLETED").length;
  const activeTasks = tasks.length - completedTasks;
  const canManageTasks = incident.current_user_role === "OWNER" || incident.current_user_role === "RESPONDER";
  const isResolved = incident.status === "RESOLVED";

  return (
    <AppShell>
      <div className="mx-auto max-w-[1450px] p-4 sm:p-6 xl:p-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <Link href="/incidents" className="inline-flex items-center gap-2 text-xs font-medium text-[#8993a1] transition hover:text-[#f1f3f5]">
            <ArrowLeft size={14} />
            All incidents
          </Link>

          <button onClick={() => void loadWorkspace(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-lg border border-[#252b35] px-3 py-2 text-xs font-medium text-[#aeb5bf] transition hover:border-[#343b46] hover:bg-[#141820] disabled:opacity-50">
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <header id="overview" className="scroll-mt-6 rounded-2xl border border-[#252b35] bg-[#0e1117]">
          <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between lg:p-6">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <SeverityBadge severity={incident.severity} />
                <IncidentStatusBadge status={incident.status} />

                {isResolved && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#54c89b]/10 px-2 py-1 text-[10px] font-semibold text-[#54c89b]">
                    <CheckCircle2 size={12} />
                    Resolved
                  </span>
                )}
              </div>

              <h1 className="break-words text-xl font-semibold tracking-tight text-[#f1f3f5] sm:text-2xl">{incident.title}</h1>

              <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-[#8993a1]">{incident.description?.trim() || "No incident description has been provided."}</p>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#68717f]">
                <span>Created {new Date(incident.created_at).toLocaleString()}</span>
                {incident.creator_name && <span>Owner: {incident.creator_name}</span>}
                {incident.updated_at && <span>Updated {new Date(incident.updated_at).toLocaleString()}</span>}
              </div>
            </div>

            <IncidentManagementControls incident={incident} canEditDetails={incident.current_user_role === "OWNER"} canChangeStatus={incident.current_user_role === "OWNER" || incident.current_user_role === "RESPONDER"} onIncidentChanged={() => loadWorkspace(true)} />
          </div>
        </header>

        <div className="my-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard icon={<ListTodo size={15} />} label="Tasks" value={tasks.length} />
          <MetricCard icon={<Clock3 size={15} />} label="Open work" value={activeTasks} accent="text-[#e7b65d]" />
          <MetricCard icon={<CheckCircle2 size={15} />} label="Completed" value={completedTasks} accent="text-[#54c89b]" />
          <MetricCard icon={<Users size={15} />} label="Responders" value={members.length} />
        </div>

        <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_390px]">
          <main className="min-w-0 space-y-5">
            <section id="war-room" className="scroll-mt-6 overflow-hidden rounded-2xl border border-[#252b35] bg-[#0e1117]">
              <div className="flex flex-col gap-4 border-b border-[#252b35] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8b9cff]/10 text-[#aab7ff]">
                      <Activity size={15} />
                    </span>
                    <h2 className="text-sm font-semibold text-[#e9ebee]">War room</h2>
                  </div>
                  <p className="mt-1 text-xs text-[#68717f]">Activity and communication for this incident.</p>
                </div>

                <div role="tablist" className="inline-flex w-fit rounded-lg bg-[#090b0f] p-1">
                  <WarRoomTab active={activeTab === "activity"} onClick={() => setActiveTab("activity")} icon={<Activity size={13} />}>
                    Activity
                  </WarRoomTab>
                  <WarRoomTab active={activeTab === "conversation"} onClick={() => setActiveTab("conversation")} icon={<MessageSquare size={13} />}>
                    Conversation
                  </WarRoomTab>
                </div>
              </div>

              {activeTab === "activity" ? <ActivityFeed incident={incident} /> : <ConversationEmptyState />}
            </section>

            <section id="incident-details" className="scroll-mt-6 rounded-2xl border border-[#252b35] bg-[#0e1117] p-5">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-[#aab7ff]" />
                <div>
                  <h2 className="text-sm font-semibold text-[#e9ebee]">Incident details</h2>
                  <p className="mt-1 text-xs text-[#68717f]">Core incident information and current operating state.</p>
                </div>
              </div>

              <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Detail label="Severity" value={<SeverityBadge severity={incident.severity} />} />
                <Detail label="Status" value={<IncidentStatusBadge status={incident.status} />} />
                <Detail label="Created" value={new Date(incident.created_at).toLocaleString()} />
                <Detail label="Last updated" value={incident.updated_at ? new Date(incident.updated_at).toLocaleString() : "Not available"} />
              </dl>
            </section>
          </main>

          <aside className="min-w-0 space-y-5">
            <section id="response-tasks" className="scroll-mt-6 rounded-2xl border border-[#252b35] bg-[#0e1117] p-4">
              {tasksError ? <ErrorState message={tasksError} onRetry={() => void refreshTasks()} /> : <TaskList incidentId={incidentId} tasks={tasks} members={members} canManage={canManageTasks} onTasksChanged={refreshTasks} />}
            </section>

            <section id="responders" className="scroll-mt-6 rounded-2xl border border-[#252b35] bg-[#0e1117] p-4">
              {membersError ? <ErrorState message={membersError} onRetry={() => void refreshMembersAndTasks()} /> : <MemberList incidentId={incidentId} members={members} incidentOwnerId={incident.created_by} canManage={incident.current_user_role === "OWNER"} onMembersChanged={refreshMembersAndTasks} />}
            </section>

            <section id="resolution" className="scroll-mt-6 rounded-2xl border border-[#252b35] bg-[#0e1117] p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className={isResolved ? "text-[#54c89b]" : "text-[#68717f]"} />
                <h2 className="text-sm font-semibold text-[#e9ebee]">Resolution</h2>
              </div>

              <p className="mt-2 text-xs leading-5 text-[#68717f]">{isResolved ? `Resolved ${incident.resolved_at ? new Date(incident.resolved_at).toLocaleString() : ""}.` : "Mark the incident resolved when impact is mitigated and response work is complete."}</p>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function MetricCard({ icon, label, value, accent = "text-[#f1f3f5]" }: { icon: React.ReactNode; label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-xl border border-[#252b35] bg-[#0e1117] px-4 py-3.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[#8993a1]">{label}</p>
        <span className="text-[#68717f]">{icon}</span>
      </div>
      <p className={`mt-2 text-xl font-semibold tabular-nums ${accent}`}>{value}</p>
    </div>
  );
}

function WarRoomTab({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button type="button" role="tab" aria-selected={active} onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${active ? "bg-[#252b35] text-[#f1f3f5]" : "text-[#78818e] hover:text-[#dce0e5]"}`}>
      {icon}
      {children}
    </button>
  );
}

function ActivityFeed({ incident }: { incident: Incident }) {
  return (
    <div className="p-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <MiniStatus label="Status" value={<IncidentStatusBadge status={incident.status} />} />
        <MiniStatus label="Severity" value={<SeverityBadge severity={incident.severity} />} />
        <MiniStatus label="Responders" value="Team coordination" />
      </div>

      <div className="mt-6 space-y-5 border-l border-[#252b35] pl-5">
        <TimelineItem title="Incident created" description="The incident workspace is ready for response coordination." time={new Date(incident.created_at).toLocaleString()} active />
        <TimelineItem title={`Current state: ${formatLabel(incident.status)}`} description="New status changes, responder actions, and task updates will appear here." />
      </div>
    </div>
  );
}

function ConversationEmptyState() {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#141820] text-[#8993a1]">
        <MessageSquare size={18} />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-[#dce0e5]">No conversation yet</h3>
      <p className="mt-1.5 max-w-sm text-xs leading-5 text-[#68717f]">This area will contain the shared incident conversation when messaging is connected.</p>
    </div>
  );
}

function MiniStatus({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-[#11151c] px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#68717f]">{label}</p>
      <div className="mt-1">{value}</div>
    </div>
  );
}

function TimelineItem({ title, description, time, active = false }: { title: string; description: string; time?: string; active?: boolean }) {
  return (
    <div className="relative">
      <span className={`absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-[#0e1117] ${active ? "bg-[#8b9cff]" : "bg-[#505865]"}`} />
      <p className="text-sm font-medium text-[#dce0e5]">{title}</p>
      <p className="mt-1 text-xs leading-5 text-[#68717f]">{description}</p>
      {time && <time className="mt-2 block text-[11px] text-[#505865]">{time}</time>}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#68717f]">{label}</dt>
      <dd className="mt-1.5 break-words text-sm text-[#dce0e5]">{value}</dd>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-[#ff6262]/20 bg-[#ff6262]/5 p-3">
      <p className="text-xs leading-5 text-[#ff8585]">{message}</p>
      <button type="button" onClick={onRetry} className="mt-2 text-xs font-medium text-[#c0c8ff] hover:text-white">
        Try again
      </button>
    </div>
  );
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
