import type { Task } from "@/types/taskTypes";

export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Response tasks</h2>

        <span className="text-xs text-[#505865]">{tasks.length} tasks</span>
      </div>

      <div className="space-y-1">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-[#141820]">
            <span
              className={`
                flex h-4 w-4 shrink-0 items-center
                justify-center rounded border
                ${task.status === "COMPLETED" ? "border-[#54c89b] bg-[#54c89b] text-[#090b0f]" : "border-[#343b46]"}
              `}
            >
              {task.status === "COMPLETED" && "✓"}
            </span>

            <div className="min-w-0 flex-1">
              <p
                className={`
                  truncate text-sm
                  ${task.status === "COMPLETED" ? "text-[#68717f] line-through" : "text-[#dce0e5]"}
                `}
              >
                {task.title}
              </p>

              {task.assigned_user_name && <p className="mt-0.5 text-xs text-[#505865]">{task.assigned_user_name}</p>}
            </div>

            <span className="text-[10px] uppercase tracking-wider text-[#68717f]">{task.status.replace("_", " ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
