"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Activity, ArrowLeft, ArrowUpRight, CheckCircle2, Clock3, ListTodo, MessageSquare, RefreshCw, ShieldAlert, Users } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { IncidentStatusBadge } from "@/components/incidents/IncidentStatusBadge";
import { SeverityBadge } from "@/components/incidents/SeverityBadge";
import { Loading } from "@/components/ui/Loading";

import { getIncidentById } from "@/api/incident.api";
import { getMembersByIncidentId } from "@/api/member.api";
import { getTasksByIncidentId } from "@/api/tasks.api";

import type { Incident } from "@/types/incidentTypes";
import type { IncidentMember } from "@/types/memberTypes";
import type { Task } from "@/types/taskTypes";

import { TaskList } from "@/components/tasks/TaskList";
import { MemberList } from "@/components/members/MemberList";
import { IncidentManagementControls } from "@/components/incidents/IncidentManagementControls";

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
      const incidentResult = await getIncidentById(incidentId);
      setIncident(incidentResult.incident);
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
      setMembers([]);
      setMembersError(membersResult.reason instanceof Error ? membersResult.reason.message : "Unable to load incident responders.");
    }

    if (tasksResult.status === "fulfilled") {
      setTasks(tasksResult.value);
    } else {
      setTasks([]);
      setTasksError(tasksResult.reason instanceof Error ? tasksResult.reason.message : "Unable to load response tasks.");
    }

    setLoading(false);
    setRefreshing(false);
  }

  async function refreshTasks() {
    try {
      const updatedTasks = await getTasksByIncidentId(incidentId);
      setTasks(updatedTasks);
      setTasksError(null);
    } catch (error) {
      setTasksError(error instanceof Error ? error.message : "Unable to refresh tasks.");
      throw error;
    }
  }

  async function refreshMembersAndTasks() {
    const [membersResult, tasksResult] = await Promise.allSettled([getMembersByIncidentId(incidentId), getTasksByIncidentId(incidentId)]);

    if (membersResult.status === "fulfilled") {
      setMembers(membersResult.value);
      setMembersError(null);
    } else {
      setMembersError(membersResult.reason instanceof Error ? membersResult.reason.message : "Unable to refresh responders.");
    }

    if (tasksResult.status === "fulfilled") {
      setTasks(tasksResult.value);
      setTasksError(null);
    } else {
      setTasksError(tasksResult.reason instanceof Error ? tasksResult.reason.message : "Unable to refresh tasks.");
    }

    if (membersResult.status === "rejected" || tasksResult.status === "rejected") {
      throw new Error("Some incident workspace data could not be refreshed.");
    }
  }

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setIncidentError(null);
      setMembersError(null);
      setTasksError(null);

      try {
        const result = await getIncidentById(incidentId);
        if (!active) return;
        setIncident(result.incident);
      } catch (error) {
        if (!active) return;
        setIncident(null);
        setIncidentError(error instanceof Error ? error.message : "Unable to load this incident.");
        setLoading(false);
        return;
      }

      const [membersResult, tasksResult] = await Promise.allSettled([getMembersByIncidentId(incidentId), getTasksByIncidentId(incidentId)]);

      if (!active) return;

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
    }

    void load();

    return () => {
      active = false;
    };
  }, [incidentId]);

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[1400px] p-6 sm:p-8">
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
            Back to incidents
          </Link>

          <div className="rounded-xl border border-[#252b35] bg-[#0e1117] p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#291719]">
              <ShieldAlert size={19} className="text-[#ff8585]" />
            </div>
            <h1 className="text-lg font-semibold text-[#e9ebee]">Unable to open incident</h1>
            <p className="mt-2 text-sm leading-6 text-[#8993a1]">{incidentError ?? "The incident could not be found."}</p>
            <button onClick={() => void loadWorkspace()} className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[#343b46] px-3 py-2 text-sm text-[#dce0e5] hover:bg-[#141820]">
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

  const resolved = incident.status === "RESOLVED";

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] p-4 sm:p-6 xl:p-8">
        {/* Breadcrumb and page actions */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link href="/incidents" className="inline-flex items-center gap-2 text-sm text-[#8993a1] transition hover:text-[#dce0e5]">
            <ArrowLeft size={15} />
            All incidents
          </Link>

          <button onClick={() => void loadWorkspace(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-lg border border-[#252b35] px-3 py-2 text-xs font-medium text-[#aeb5bf] transition hover:bg-[#141820] disabled:opacity-50">
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Incident header */}
        <header id="overview" className="scroll-mt-6 mb-6 rounded-xl border border-[#252b35] bg-[#0e1117] p-5 sm:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <SeverityBadge severity={incident.severity} />
                <IncidentStatusBadge status={incident.status} />
                {resolved && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-[#285a48] px-2 py-1 text-[10px] font-medium text-[#54c89b]">
                    <CheckCircle2 size={12} />
                    Resolved
                  </span>
                )}
              </div>

              <h1 className="break-words text-2xl font-semibold tracking-tight text-[#f1f3f5] sm:text-3xl">{incident.title}</h1>

              <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-[#8993a1]">{incident.description?.trim() || "No incident description has been provided."}</p>

              <IncidentManagementControls incident={incident} canEditDetails={incident.current_user_role === "OWNER"} canChangeStatus={incident.current_user_role === "OWNER" || incident.current_user_role === "RESPONDER"} onIncidentChanged={() => loadWorkspace(true)} />

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#68717f]">
                <span>Created {new Date(incident.created_at).toLocaleString()}</span>
                {incident.creator_name && <span>Owner: {incident.creator_name}</span>}
                {incident.updated_at && <span>Updated {new Date(incident.updated_at).toLocaleString()}</span>}
              </div>
            </div>
          </div>
        </header>

        {/* Workspace metrics */}
        <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricCard icon={<ListTodo size={16} />} label="Total tasks" value={tasks.length} detail={tasksError ? "Tasks unavailable" : "Incident task list"} />
          <MetricCard icon={<Clock3 size={16} />} label="Outstanding" value={activeTasks} detail="To do or in progress" />
          <MetricCard icon={<CheckCircle2 size={16} />} label="Completed" value={completedTasks} detail="Tasks marked complete" />
          <MetricCard icon={<Users size={16} />} label="Responders" value={members.length} detail={membersError ? "Members unavailable" : "Incident members"} />
        </div>

        {/* Main response workspace */}
        <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <main className="min-w-0 space-y-5">
            {/* Activity / conversation switcher */}
            <section id="war-room" className="scroll-mt-6 overflow-hidden rounded-xl border border-[#252b35] bg-[#0e1117]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252b35] px-4 py-4 sm:px-5">
                <div>
                  <h2 className="text-sm font-semibold text-[#e9ebee]">War room</h2>
                  <p className="mt-1 text-xs text-[#68717f]">Incident activity and responder collaboration</p>
                </div>

                <div role="tablist" aria-label="War room views" className="flex rounded-lg border border-[#252b35] bg-[#0b0e13] p-1">
                  <TabButton active={activeTab === "activity"} onClick={() => setActiveTab("activity")} icon={<Activity size={13} />}>
                    Activity
                  </TabButton>
                  <TabButton active={activeTab === "conversation"} onClick={() => setActiveTab("conversation")} icon={<MessageSquare size={13} />}>
                    Conversation
                  </TabButton>
                </div>
              </div>

              {activeTab === "activity" ? <ActivityPlaceholder createdAt={incident.created_at} status={incident.status} /> : <ConversationPlaceholder />}
            </section>

            {/* Incident details */}
            <section id="incident-details" className="scroll-mt-6 rounded-xl border border-[#252b35] bg-[#0e1117] p-5">
              <SectionHeading icon={<ShieldAlert size={15} />} title="Incident details" subtitle="Context responders need to investigate and resolve the issue." />

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <DetailField label="Severity" value={incident.severity} />
                <DetailField label="Current status" value={formatLabel(incident.status)} />
                <DetailField label="Created" value={new Date(incident.created_at).toLocaleString()} />
                <DetailField label="Last updated" value={incident.updated_at ? new Date(incident.updated_at).toLocaleString() : "Not available"} />
              </div>

              {resolved && (
                <div className="mt-5 rounded-lg border border-[#285a48] bg-[#102018] p-3">
                  <p className="text-sm font-medium text-[#54c89b]">Incident resolved</p>
                  <p className="mt-1 text-xs leading-5 text-[#8bb8a5]">Resolution summary and resolved timestamp will be shown here when the resolution workflow is implemented.</p>
                </div>
              )}
            </section>
          </main>

          {/* Operational side panels */}
          <aside className="min-w-0 space-y-5">
            <section id="response-tasks" className="scroll-mt-6 rounded-xl border border-[#252b35] bg-[#0e1117] p-4">
              {tasksError ? (
                <div role="alert" className="text-sm text-[#ff8585]">
                  <p>{tasksError}</p>
                  <button type="button" onClick={() => void refreshTasks().catch(() => undefined)} className="mt-2 underline underline-offset-4">
                    Retry
                  </button>
                </div>
              ) : (
                <TaskList incidentId={incidentId} tasks={tasks} members={members} canManage={incident.current_user_role === "OWNER" || incident.current_user_role === "RESPONDER"} onTasksChanged={refreshTasks} />
              )}
            </section>

            <section id="responders" className="scroll-mt-6 rounded-xl border border-[#252b35] bg-[#0e1117] p-4">
              {membersError ? (
                <div role="alert" className="text-sm text-[#ff8585]">
                  <p>{membersError}</p>
                  <button type="button" onClick={() => void refreshMembersAndTasks().catch(() => undefined)} className="mt-2 underline underline-offset-4">
                    Retry
                  </button>
                </div>
              ) : (
                <MemberList incidentId={incidentId} members={members} incidentOwnerId={incident.created_by} canManage={incident.current_user_role === "OWNER"} onMembersChanged={refreshMembersAndTasks} />
              )}
            </section>

            <section id="resolution" className="scroll-mt-6 rounded-xl border border-[#252b35] bg-[#0e1117] p-4">
              <div className="flex items-center gap-2">
                <Clock3 size={15} className="text-[#8993a1]" />
                <h2 className="text-sm font-semibold text-[#dce0e5]">Resolution</h2>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#68717f]">Resolution summary, final status confirmation, and resolved timestamp will be recorded here. This section will become actionable in the resolution workflow step.</p>
            </section>
          </aside>
        </div>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-[#1b2028] pt-4 text-[10px] text-[#505865]">
          <span>OpsPulse incident workspace</span>
          <span>Incident ID: {incident.id}</span>
        </footer>
      </div>
    </AppShell>
  );
}

function MetricCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: number; detail: string }) {
  return (
    <div className="rounded-xl border border-[#252b35] bg-[#0e1117] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs text-[#8993a1]">{label}</span>
        <span className="text-[#68717f]">{icon}</span>
      </div>
      <p className="text-2xl font-semibold tabular-nums text-[#f1f3f5]">{value}</p>
      <p className="mt-1 text-[10px] text-[#68717f]">{detail}</p>
    </div>
  );
}

function SectionHeading({ icon, title, subtitle, trailing }: { icon: React.ReactNode; title: string; subtitle?: string; trailing?: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-[#a4b0ff]">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[#e9ebee]">{title}</h2>
          {trailing !== undefined && <span className="rounded-md border border-[#252b35] px-2 py-0.5 text-[10px] text-[#8993a1]">{trailing}</span>}
        </div>
        {subtitle && <p className="mt-1 text-xs leading-5 text-[#68717f]">{subtitle}</p>}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button type="button" role="tab" aria-selected={active} onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition ${active ? "bg-[#252b35] text-[#f1f3f5]" : "text-[#78818e] hover:text-[#dce0e5]"}`}>
      {icon}
      {children}
    </button>
  );
}

function ActivityPlaceholder({ createdAt, status }: { createdAt: string; status: string }) {
  return (
    <div className="p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3 rounded-lg border border-[#343b46] bg-[#11151c] p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#252b35]">
          <Activity size={15} className="text-[#a4b0ff]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[#dce0e5]">Activity feed foundation</p>
          <p className="mt-1 text-xs leading-5 text-[#8993a1]">This feed will display persisted incident events such as status changes, task updates, and responder changes. The current database has an incident-events table, but this page will not fabricate events while its reader and event writers are being implemented.</p>
        </div>
      </div>

      <div className="relative ml-2 border-l border-[#252b35]">
        <div className="relative pb-6 pl-7">
          <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-[#8b9cff] ring-4 ring-[#0e1117]" />
          <p className="text-sm font-medium text-[#dce0e5]">Incident created</p>
          <p className="mt-1 text-xs text-[#68717f]">This is derived from the incident record, not a fabricated event.</p>
          <time className="mt-2 block text-xs text-[#505865]">{new Date(createdAt).toLocaleString()}</time>
        </div>

        <div className="relative pl-7">
          <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-[#505865] ring-4 ring-[#0e1117]" />
          <p className="text-sm font-medium text-[#dce0e5]">Current status: {formatLabel(status)}</p>
          <p className="mt-1 text-xs text-[#68717f]">Historical status transitions will appear after event logging is connected.</p>
        </div>
      </div>
    </div>
  );
}

function ConversationPlaceholder() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#252b35] bg-[#141820]">
        <MessageSquare size={20} className="text-[#8993a1]" />
      </div>
      <h3 className="text-sm font-semibold text-[#dce0e5]">Incident conversation</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#68717f]">A shared responder chat will live here. Messages, author identity, timestamps, and message submission will be connected after the incident messaging API is verified.</p>
      <span className="mt-4 rounded-md border border-[#343b46] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#8993a1]">Messaging planned</span>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#68717f]">{label}</p>
      <p className="mt-1.5 break-words text-sm text-[#dce0e5]">{value}</p>
    </div>
  );
}

function EmptyPanel({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="px-5 py-8 text-center">
      <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-[#252b35] bg-[#141820] text-[#8993a1]">{icon}</div>
      <p className="text-sm font-medium text-[#dce0e5]">{title}</p>
      <p className="mx-auto mt-1.5 max-w-xs text-xs leading-5 text-[#68717f]">{description}</p>
    </div>
  );
}

function PanelError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="p-4">
      <p className="text-xs leading-5 text-[#ff8585]">{message}</p>
      <button onClick={onRetry} className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#c0c8ff] hover:text-[#e0e4ff]">
        <RefreshCw size={12} />
        Retry
      </button>
    </div>
  );
}

function TaskStatusIcon({ status }: { status: Task["status"] }) {
  if (status === "COMPLETED") {
    return <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#54c89b]" />;
  }

  if (status === "IN_PROGRESS") {
    return <Clock3 size={16} className="mt-0.5 shrink-0 text-[#d9b66e]" />;
  }

  return <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#505865]" />;
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
