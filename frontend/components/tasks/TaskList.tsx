"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createTask, deleteTask, updateTask } from "@/api/tasks.api";
import type { IncidentMember } from "@/types/memberTypes";
import type { Task, TaskStatus } from "@/types/taskTypes";

interface TaskListProps {
  incidentId: string;
  tasks: Task[];
  members: IncidentMember[];
  canManage: boolean;
  onTasksChanged: () => Promise<void>;
}

const statusLabels: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

export function TaskList({ incidentId, tasks, members, canManage, onTasksChanged }: TaskListProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [creating, setCreating] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const completedCount = tasks.filter((task) => task.status === "COMPLETED").length;

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (title.trim().length < 3) {
      setError("Task title must contain at least 3 characters.");
      return;
    }

    setCreating(true);

    try {
      await createTask(incidentId, {
        title: title.trim(),
        description: description.trim() || null,
        assignedTo: newAssignee || null,
      });

      setTitle("");
      setDescription("");
      setNewAssignee("");
      await onTasksChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create task.");
    } finally {
      setCreating(false);
    }
  }

  async function handleStatusChange(task: Task, status: TaskStatus) {
    setError(null);
    setPendingTaskId(task.id);

    try {
      await updateTask(task.id, { status });
      await onTasksChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update task.");
    } finally {
      setPendingTaskId(null);
    }
  }

  async function handleAssigneeChange(task: Task, assignedTo: string) {
    setError(null);
    setPendingTaskId(task.id);

    try {
      await updateTask(task.id, { assignedTo: assignedTo || null });
      await onTasksChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to assign task.");
    } finally {
      setPendingTaskId(null);
    }
  }

  async function handleDelete(task: Task) {
    const confirmed = window.confirm(`Delete "${task.title}"? This action cannot be undone.`);

    if (!confirmed) return;

    setError(null);
    setPendingTaskId(task.id);

    try {
      await deleteTask(task.id);
      await onTasksChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete task.");
    } finally {
      setPendingTaskId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[#dce0e5]">Response tasks</h2>
          <p className="mt-1 text-xs text-[#68717f]">Track the work required to resolve this incident.</p>
        </div>

        <span className="shrink-0 rounded-md border border-[#252b35] px-2 py-1 text-xs text-[#9ca4b1]">
          {completedCount}/{tasks.length} done
        </span>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-[#ff6262]/25 bg-[#ff6262]/5 px-3 py-2 text-sm text-[#ff8585]">
          {error}
        </div>
      )}

      {canManage && (
        <form onSubmit={handleCreate} className="space-y-3 rounded-lg border border-[#252b35] bg-[#10141b] p-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[#9ca4b1]">Task title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={255} minLength={3} required placeholder="e.g. Check database connection pool" className="w-full rounded-md border border-[#303744] bg-[#0b0e13] px-3 py-2 text-sm text-[#dce0e5] outline-none placeholder:text-[#505865] focus:border-[#7185ff]" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[#9ca4b1]">
              Description <span className="text-[#505865]">(optional)</span>
            </span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={5000} rows={2} placeholder="Add useful context or completion criteria" className="w-full resize-y rounded-md border border-[#303744] bg-[#0b0e13] px-3 py-2 text-sm text-[#dce0e5] outline-none placeholder:text-[#505865] focus:border-[#7185ff]" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[#9ca4b1]">Assign to</span>
            <select value={newAssignee} onChange={(event) => setNewAssignee(event.target.value)} className="w-full rounded-md border border-[#303744] bg-[#0b0e13] px-3 py-2 text-sm text-[#dce0e5] outline-none focus:border-[#7185ff]">
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.role.toLowerCase()})
                </option>
              ))}
            </select>
          </label>

          <button type="submit" disabled={creating} className="inline-flex items-center gap-2 rounded-md bg-[#dce4ff] px-3 py-2 text-sm font-semibold text-[#111827] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50">
            <Plus size={15} />
            {creating ? "Creating..." : "Add task"}
          </button>
        </form>
      )}

      {tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#303744] px-4 py-8 text-center">
          <p className="text-sm text-[#9ca4b1]">No response tasks yet.</p>
          {canManage && <p className="mt-1 text-xs text-[#68717f]">Create a task to give the team a clear next action.</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const isPending = pendingTaskId === task.id;

            return (
              <article key={task.id} className="rounded-lg border border-[#252b35] bg-[#10141b] p-3">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${task.status === "COMPLETED" ? "border-[#54c89b] bg-[#54c89b] text-[#09110e]" : "border-[#414957] text-[#68717f]"}`} aria-label={statusLabels[task.status]}>
                    {task.status === "COMPLETED" ? "✓" : ""}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={`break-words text-sm font-medium ${task.status === "COMPLETED" ? "text-[#68717f] line-through" : "text-[#dce0e5]"}`}>{task.title}</p>

                    {task.description && <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-[#68717f]">{task.description}</p>}

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                      {canManage ? (
                        <label className="min-w-0 flex-1">
                          <span className="sr-only">Assignee for {task.title}</span>
                          <select value={task.assigned_user_id ?? ""} disabled={isPending} onChange={(event) => handleAssigneeChange(task, event.target.value)} className="w-full rounded-md border border-[#303744] bg-[#0b0e13] px-2 py-1.5 text-xs text-[#9ca4b1] outline-none focus:border-[#7185ff] disabled:opacity-50">
                            <option value="">Unassigned</option>
                            {members.map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : (
                        <p className="min-w-0 flex-1 text-xs text-[#68717f]">{task.assigned_user_name ?? "Unassigned"}</p>
                      )}

                      {canManage ? (
                        <label>
                          <span className="sr-only">Status for {task.title}</span>
                          <select value={task.status} disabled={isPending} onChange={(event) => handleStatusChange(task, event.target.value as TaskStatus)} className="w-full rounded-md border border-[#303744] bg-[#0b0e13] px-2 py-1.5 text-xs text-[#dce0e5] outline-none focus:border-[#7185ff] disabled:opacity-50 sm:w-auto">
                            {Object.entries(statusLabels).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : (
                        <span className="text-xs text-[#9ca4b1]">{statusLabels[task.status]}</span>
                      )}

                      {canManage && (
                        <button type="button" disabled={isPending} onClick={() => handleDelete(task)} aria-label={`Delete ${task.title}`} title="Delete task" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#68717f] transition hover:bg-[#ff6262]/10 hover:text-[#ff8585] disabled:opacity-50">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>

                    {isPending && <p className="mt-2 text-[11px] text-[#68717f]">Saving changes…</p>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
