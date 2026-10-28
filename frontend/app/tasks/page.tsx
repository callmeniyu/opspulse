"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, Circle, Clock3, ListTodo, RefreshCw } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { IncidentMeta } from "@/components/incidents/IncidentMeta";
import { Loading } from "@/components/ui/Loading";
import { getMyTasks } from "@/api/personalWork.api";
import type { MyTask } from "@/types/personalWorkTypes";
import type { TaskStatus } from "@/types/taskTypes";

type TaskFilter = "ALL" | TaskStatus;

const filters: { label: string; value: TaskFilter }[] = [
  { label: "All tasks", value: "ALL" },
  { label: "To do", value: "TODO" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
];

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<MyTask[]>([]);
  const [filter, setFilter] = useState<TaskFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTasks() {
    setLoading(true);
    setError(null);

    try {
      setTasks(await getMyTasks());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load your tasks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTasks();
  }, []);

  const counts = useMemo(
    () => ({
      all: tasks.length,
      todo: tasks.filter((task) => task.status === "TODO").length,
      inProgress: tasks.filter((task) => task.status === "IN_PROGRESS").length,
      completed: tasks.filter((task) => task.status === "COMPLETED").length,
    }),
    [tasks],
  );

  const visibleTasks = useMemo(() => (filter === "ALL" ? tasks : tasks.filter((task) => task.status === filter)), [tasks, filter]);

  const groups = useMemo(() => {
    const byIncident = new Map<string, MyTask[]>();

    for (const task of visibleTasks) {
      const group = byIncident.get(task.incident_id) ?? [];
      group.push(task);
      byIncident.set(task.incident_id, group);
    }

    return Array.from(byIncident.entries()).map(([incidentId, items]) => ({
      incidentId,
      incidentTitle: items[0].incident_title,
      incidentSeverity: items[0].incident_severity,
      incidentStatus: items[0].incident_status,
      tasks: items,
    }));
  }, [visibleTasks]);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] p-5 sm:p-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[#68717f]">Personal workspace</p>
            <h1 className="text-2xl font-semibold tracking-tight">My tasks</h1>
            <p className="mt-1 text-sm text-[#68717f]">Your assigned actions across incident response.</p>
          </div>

          <button onClick={() => void loadTasks()} disabled={loading} className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-[#252b35] px-3 py-2 text-sm text-[#aeb5bf] transition hover:bg-[#141820] disabled:opacity-50 sm:self-auto">
            <RefreshCw size={14} />
            Refresh
          </button>
        </header>

        <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#252b35] bg-[#252b35] sm:grid-cols-4">
          <Stat label="Assigned to me" value={counts.all} />
          <Stat label="To do" value={counts.todo} />
          <Stat label="In progress" value={counts.inProgress} />
          <Stat label="Completed" value={counts.completed} />
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button key={item.value} onClick={() => setFilter(item.value)} className={`rounded-lg px-3 py-2 text-xs font-medium transition ${filter === item.value ? "bg-[#e8ebef] text-[#090b0f]" : "border border-[#252b35] text-[#8993a1] hover:bg-[#141820] hover:text-[#dce0e5]"}`}>
              {item.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-xl border border-[#252b35] bg-[#0e1117] p-8">
            <Loading label="Loading your tasks" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-[#74383d] bg-[#190f12] p-5">
            <p className="text-sm text-[#ff8585]">{error}</p>
            <button onClick={() => void loadTasks()} className="mt-3 text-sm text-[#dce0e5] underline underline-offset-4">
              Try again
            </button>
          </div>
        ) : visibleTasks.length === 0 ? (
          <div className="rounded-xl border border-[#252b35] bg-[#0e1117] px-5 py-14 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[#252b35] bg-[#141820]">
              <ListTodo size={18} className="text-[#8993a1]" />
            </div>
            <h2 className="text-sm font-semibold text-[#dce0e5]">{tasks.length === 0 ? "No tasks assigned" : "No tasks in this view"}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-[#68717f]">{tasks.length === 0 ? "Tasks assigned to you during incident response will appear here." : "Choose another status filter to see your other tasks."}</p>
            {tasks.length === 0 && (
              <Link href="/incidents" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#a4b0ff] hover:text-[#c0c8ff]">
                Browse incidents <ArrowUpRight size={14} />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map((group) => (
              <section key={group.incidentId} className="overflow-hidden rounded-xl border border-[#252b35] bg-[#0e1117]">
                <Link href={`/incidents/${group.incidentId}`} className="flex items-center justify-between gap-4 border-b border-[#252b35] px-4 py-4 transition hover:bg-[#11151c] sm:px-5">
                  <IncidentMeta title={group.incidentTitle} severity={group.incidentSeverity} status={group.incidentStatus} />
                  <div className="flex shrink-0 items-center gap-2 text-xs text-[#68717f]">
                    {group.tasks.length} {group.tasks.length === 1 ? "task" : "tasks"}
                    <ArrowUpRight size={14} />
                  </div>
                </Link>

                <div className="divide-y divide-[#1b2028]">
                  {group.tasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 px-4 py-4 sm:px-5">
                      <TaskIcon status={task.status} />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${task.status === "COMPLETED" ? "text-[#68717f] line-through" : "text-[#dce0e5]"}`}>{task.title}</p>
                        {task.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#68717f]">{task.description}</p>}
                        <p className="mt-2 text-[10px] uppercase tracking-wider text-[#68717f]">Updated {new Date(task.updated_at).toLocaleDateString()}</p>
                      </div>
                      <TaskStatusLabel status={task.status} />
                    </div>
                  ))}
                </div>
              </section>
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

function TaskIcon({ status }: { status: TaskStatus }) {
  if (status === "COMPLETED") {
    return <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#54c89b]" />;
  }
  if (status === "IN_PROGRESS") {
    return <Clock3 size={16} className="mt-0.5 shrink-0 text-[#d9b66e]" />;
  }
  return <Circle size={16} className="mt-0.5 shrink-0 text-[#68717f]" />;
}

function TaskStatusLabel({ status }: { status: TaskStatus }) {
  const styles: Record<TaskStatus, string> = {
    TODO: "text-[#8993a1] border-[#343b46]",
    IN_PROGRESS: "text-[#d9b66e] border-[#69572e]",
    COMPLETED: "text-[#54c89b] border-[#285a48]",
  };

  const labels: Record<TaskStatus, string> = {
    TODO: "To do",
    IN_PROGRESS: "In progress",
    COMPLETED: "Completed",
  };

  return <span className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-medium ${styles[status]}`}>{labels[status]}</span>;
}
