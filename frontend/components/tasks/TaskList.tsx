"use client";

import { useState, type FormEvent } from "react";
import { Check, CheckCircle2, Circle, Clock3, LoaderCircle, Pencil, Plus, Trash2, UserRound, X, ListTodo } from "lucide-react";

import { createTask, deleteTask, updateTask, updateTaskStatus } from "@/api/tasks.api";
import type { IncidentMember } from "@/types/memberTypes";
import type { Task, TaskStatus } from "@/types/taskTypes";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { useToast } from "@/components/ui/ToastProvider";

interface TaskListProps {
  incidentId: string;
  tasks: Task[];
  members: IncidentMember[];
  currentUserId: string | null;
  currentUserRole: IncidentMember["role"];
  canManage: boolean;
  onTasksChanged: () => Promise<void>;
}

type TaskDialogMode = "create" | "edit" | "status";

const statusLabels: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

const statusStyles: Record<TaskStatus, string> = {
  TODO: "border-[#6fa9ff]/40 bg-[#6fa9ff]/10 text-[#6fa9ff]",
  IN_PROGRESS: "border-[#e7b65d]/40 bg-[#e7b65d]/10 text-[#e7b65d]",
  COMPLETED: "border-[#54c89b]/40 bg-[#54c89b]/10 text-[#54c89b]",
};

const statusIndicatorStyles: Record<TaskStatus, string> = {
  TODO: "border-[#6fa9ff] bg-[#6fa9ff]/10 text-[#6fa9ff]",
  IN_PROGRESS: "border-[#e7b65d] bg-[#e7b65d]/10 text-[#e7b65d]",
  COMPLETED: "border-[#54c89b] bg-[#54c89b] text-[#07120d]",
};

const roleStyles: Record<"OWNER" | "RESPONDER" | "VIEWER", string> = {
  OWNER: "text-[#aab7ff]",
  RESPONDER: "text-[#6fa9ff]",
  VIEWER: "text-[#aeb5bf]",
};

export function TaskList({ incidentId, tasks, members, currentUserId, currentUserRole, canManage, onTasksChanged }: TaskListProps) {
  const [taskDialog, setTaskDialog] = useState<{ task?: Task; mode: TaskDialogMode } | null>(null);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [confirmTask, setConfirmTask] = useState<Task | null>(null);
  const { showToast } = useToast();

  const completed = tasks.filter((task) => task.status === "COMPLETED").length;

  async function removeTask(task: Task) {
    setPendingTaskId(task.id);

    try {
      await deleteTask(task.id);
      await onTasksChanged();
      showToast("Task deleted.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to delete this task.", "error");
    } finally {
      setPendingTaskId(null);
    }
  }

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ListIcon />
            <h2 className="text-sm font-semibold text-[#e9ebee]">Response tasks</h2>
          </div>
          <p className="mt-1 text-xs text-[#68717f]">
            {completed}/{tasks.length} completed
          </p>
        </div>

        {canManage && (
          <button type="button" onClick={() => setTaskDialog({ mode: "create" })} className="inline-flex items-center gap-1.5 rounded-lg bg-[#f1f3f5] px-3 py-2 text-xs font-semibold text-[#090b0f] transition hover:bg-white">
            <Plus size={14} />
            Add task
          </button>
        )}
      </div>

      <div className="mt-4">
        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#343b46] px-4 py-8 text-center">
            <p className="text-sm font-medium text-[#aeb5bf]">No response tasks yet</p>
            <p className="mt-1 text-xs text-[#68717f]">Create a focused next action for the response team.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1b2028]">
            {tasks.map((task) => {
              const pending = pendingTaskId === task.id;
              const completedTask = task.status === "COMPLETED";
              const isTaskCreator = task.created_by === currentUserId;
              const isViewer = currentUserRole === "VIEWER";

              const canEditTask = isTaskCreator && !isViewer;
              const canChangeStatus = !isViewer && (isTaskCreator || canManage);

              return (
                <article key={task.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <span aria-label={statusLabels[task.status]} className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${statusIndicatorStyles[task.status]}`}>
                      {completedTask ? <Check size={12} strokeWidth={3} /> : task.status === "IN_PROGRESS" ? <Clock3 size={11} /> : <Circle size={8} fill="currentColor" />}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className={`break-words text-sm font-medium ${completedTask ? "text-[#68717f] line-through" : "text-[#dce0e5]"}`}>{task.title}</p>
                          {task.description && <p className="mt-1 break-words text-xs leading-5 text-[#68717f]">{task.description}</p>}
                        </div>

                        {(canEditTask || canChangeStatus) && (
                          <div className="flex shrink-0 items-center">
                            <button
                              type="button"
                              disabled={pending}
                              onClick={() => setTaskDialog({ task, mode: canEditTask ? "edit" : "status" })}
                              aria-label={`Edit ${task.title}`}
                              title={canEditTask ? "Edit task" : "Update task status"}
                              className="rounded-md p-1.5 text-[#68717f] transition hover:bg-[#1a202a] hover:text-[#dce0e5]"
                            >
                              <Pencil size={14} />
                            </button>
                            {canEditTask && (
                                <button type="button" disabled={pending} onClick={() => setConfirmTask(task)} aria-label={`Delete ${task.title}`} className="rounded-md p-1.5 text-[#68717f] transition hover:bg-[#ff6262]/10 hover:text-[#ff8585]">
                                  {pending ? <LoaderCircle size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <TaskStatus status={task.status} />
                          <div className={`inline-flex items-center gap-1.5 text-md`}>
                            <div className="flex gap-1 items-center">
                              <UserRound size={15} />
                              <p className={`${roleStyles[task.assigned_user_role ?? "VIEWER"]}`}>{task.assigned_user_name ?? "Unassigned"}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">Ceated By: {task.created_by_name ?? "Unknown"}</div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {taskDialog && (
        <TaskDialog
          mode={taskDialog.mode}
          title={taskDialog.mode === "create" ? "Create response task" : taskDialog.mode === "status" ? "Update task status" : "Edit task"}
          members={members}
          initialTask={taskDialog.task}
          submitLabel={taskDialog.mode === "create" ? "Create task" : taskDialog.mode === "status" ? "Update status" : "Save changes"}
          onClose={() => setTaskDialog(null)}
          onSubmit={async (data) => {
            if (taskDialog.mode === "create") {
              await createTask(incidentId, { title: data.title!, description: data.description, assignedTo: data.assignedTo });
              showToast("Task created.", "success");
            } else if (taskDialog.mode === "status") {
              await updateTaskStatus(taskDialog.task!.id, data.status!);
              showToast("Task status updated.", "success");
            } else {
              const task = taskDialog.task!;
              await updateTask(task.id, { title: data.title!, description: data.description, assignedTo: data.assignedTo });
              if (data.status && data.status !== task.status) {
                await updateTaskStatus(task.id, data.status);
              }
              showToast("Task updated.", "success");
            }
            await onTasksChanged();
            setTaskDialog(null);
          }}
        />
      )}
      {confirmTask && (
        <ConfirmationDialog
          title="Delete task?"
          message={`Delete “${confirmTask.title}”? This cannot be undone.`}
          confirmLabel="Delete"
          onCancel={() => setConfirmTask(null)}
          onConfirm={() => {
            const task = confirmTask;
            setConfirmTask(null);
            void removeTask(task);
          }}
        />
      )}
    </>
  );
}

function TaskDialog({ title, mode, members, initialTask, submitLabel, onClose, onSubmit }: { title: string; mode: TaskDialogMode; members: IncidentMember[]; initialTask?: Task; submitLabel: string; onClose: () => void; onSubmit: (data: { title?: string; description?: string | null; assignedTo?: string | null; status?: TaskStatus }) => Promise<void> }) {
  const [taskTitle, setTaskTitle] = useState(initialTask?.title ?? "");
  const [description, setDescription] = useState(initialTask?.description ?? "");
  const [assignedTo, setAssignedTo] = useState(initialTask?.assigned_user_id ?? "");
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status ?? "TODO");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode !== "status" && taskTitle.trim().length < 3) {
      setError("Task title must contain at least 3 characters.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (mode === "status") {
        await onSubmit({ status });
      } else {
        await onSubmit({
          title: taskTitle.trim(),
          description: description.trim() || null,
          assignedTo: assignedTo || null,
          ...(mode === "edit" ? { status } : {}),
        });
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to save task.", "error");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end overflow-y-auto bg-black/65 p-0 sm:items-center sm:justify-center sm:p-5">
      <form onSubmit={submit} className="my-auto max-h-[calc(100dvh-1.25rem)] w-full overflow-y-auto rounded-t-2xl border border-[#343b46] bg-[#0e1117] p-5 shadow-2xl sm:max-h-[calc(100dvh-2.5rem)] sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-[#f1f3f5]">{title}</h3>
            <p className="mt-1 text-xs text-[#68717f]">{mode === "status" ? "Update the task progress." : "Create a clear, owned next action."}</p>
          </div>

          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg p-2 text-[#8993a1] hover:bg-[#1a202a] hover:text-white">
            <X size={17} />
          </button>
        </div>

        {error && <p className="mt-4 rounded-lg border border-[#ff6262]/20 bg-[#ff6262]/5 px-3 py-2 text-xs text-[#ff8585]">{error}</p>}

        <div className="mt-5 space-y-4">
          {mode !== "status" && <>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[#aeb5bf]">Task title</span>
            <input autoFocus required minLength={3} maxLength={255} value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="e.g. Check database connection pool" className="w-full rounded-lg border border-[#303744] bg-[#090b0f] px-3 py-2.5 text-sm text-[#e9ebee] outline-none placeholder:text-[#505865] focus:border-[#7185ff]" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[#aeb5bf]">
              Description <span className="text-[#505865]">(optional)</span>
            </span>
            <textarea rows={4} maxLength={5000} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What needs to happen? What does done look like?" className="w-full resize-none rounded-lg border border-[#303744] bg-[#090b0f] px-3 py-2.5 text-sm text-[#e9ebee] outline-none placeholder:text-[#505865] focus:border-[#7185ff]" />
          </label>
          </>}

          {mode !== "create" && (
            <fieldset>
              <legend className="mb-1.5 text-xs font-medium text-[#aeb5bf]">Status</legend>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(statusLabels) as TaskStatus[]).map((option) => {
                  const selected = status === option;

                  return (
                    <button key={option} type="button" onClick={() => setStatus(option)} className={`rounded-lg border px-2 py-2 text-center text-[11px] font-medium transition ${selected ? statusStyles[option] : "border-[#303744] bg-[#090b0f] text-[#68717f] hover:border-[#505865]"}`}>
                      {statusLabels[option]}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {mode !== "status" && <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[#aeb5bf]">Assignee</span>
            <div className="max-h-44 space-y-1 overflow-y-auto rounded-lg border border-[#303744] bg-[#090b0f] p-1.5">
              <button type="button" onClick={() => setAssignedTo("")} className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs transition ${assignedTo === "" ? "bg-[#252b35] text-[#f1f3f5]" : "text-[#8993a1] hover:bg-[#141820]"}`}>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#252b35] text-[#8993a1]">
                  <UserRound size={12} />
                </span>
                <span className="flex-1">Unassigned</span>
                {assignedTo === "" && <Check size={14} className="text-[#aab7ff]" />}
              </button>

              {members.map((member) => {
                const selected = assignedTo === member.id;

                return (
                  <button key={member.id} type="button" onClick={() => setAssignedTo(member.id)} className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left transition ${selected ? "bg-[#252b35] text-[#f1f3f5]" : "text-[#8993a1] hover:bg-[#141820]"}`}>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#343b46] text-[10px] font-semibold text-[#dce0e5]">{member.name.slice(0, 1).toUpperCase()}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium">{member.name}</span>
                      <span className="block text-[10px] text-[#68717f]">{member.role.toLowerCase()}</span>
                    </span>
                    {selected && <Check size={14} className="shrink-0 text-[#aab7ff]" />}
                  </button>
                );
              })}
            </div>
            <select aria-hidden="true" tabIndex={-1} value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} className="hidden">
              <option value="">Leave unassigned</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} · {member.role.toLowerCase()}
                </option>
              ))}
            </select>
          </label>}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" disabled={saving} onClick={onClose} className="rounded-lg px-3 py-2 text-sm text-[#aeb5bf] hover:bg-[#1a202a]">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#f1f3f5] px-3.5 py-2 text-sm font-semibold text-[#090b0f] hover:bg-white disabled:opacity-50">
            {saving && <LoaderCircle size={14} className="animate-spin" />}
            {saving ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

function TaskStatus({ status }: { status: TaskStatus }) {
  const icon = status === "COMPLETED" ? <ListTodo size={12} /> : status === "IN_PROGRESS" ? <Clock3 size={12} /> : <Circle size={12} />;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm  font-medium ${statusStyles[status]}`}>
      {icon}
      {statusLabels[status]}
    </span>
  );
}

function ListIcon() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8b9cff]/10 text-[#aab7ff]">
      <CheckCircle2 size={15} />
    </span>
  );
}
