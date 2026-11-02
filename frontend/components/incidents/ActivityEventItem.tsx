import { ArrowRightLeft, CheckCircle2, CircleDot, Pencil, Plus, ShieldAlert, Trash2, UserMinus, UserPlus, Users } from "lucide-react";

import type { IncidentEvent, IncidentEventType } from "@/types/incidentEventTypes";

const eventTones: Record<IncidentEventType, { card: string; dot: string; icon: string; label: string }> = {
  INCIDENT_CREATED: { card: "border-[#54c89b]/25 bg-[#54c89b]/[0.04]", dot: "bg-[#54c89b]", icon: "text-[#54c89b]", label: "Incident created" },
  INCIDENT_UPDATED: { card: "border-[#6fa9ff]/20 bg-[#6fa9ff]/[0.035]", dot: "bg-[#6fa9ff]", icon: "text-[#6fa9ff]", label: "Incident updated" },
  INCIDENT_STATUS_CHANGED: { card: "border-[#aab7ff]/25 bg-[#aab7ff]/[0.04]", dot: "bg-[#aab7ff]", icon: "text-[#aab7ff]", label: "Status changed" },
  INCIDENT_SEVERITY_CHANGED: { card: "border-[#e7b65d]/25 bg-[#e7b65d]/[0.04]", dot: "bg-[#e7b65d]", icon: "text-[#e7b65d]", label: "Severity changed" },
  MEMBER_ADDED: { card: "border-[#54c89b]/25 bg-[#54c89b]/[0.04]", dot: "bg-[#54c89b]", icon: "text-[#54c89b]", label: "Member added" },
  MEMBER_REMOVED: { card: "border-[#ff7078]/25 bg-[#ff7078]/[0.04]", dot: "bg-[#ff7078]", icon: "text-[#ff8585]", label: "Member removed" },
  MEMBER_ROLE_UPDATED: { card: "border-[#e7b65d]/25 bg-[#e7b65d]/[0.04]", dot: "bg-[#e7b65d]", icon: "text-[#e7b65d]", label: "Role changed" },
  TASK_CREATED: { card: "border-[#54c89b]/25 bg-[#54c89b]/[0.04]", dot: "bg-[#54c89b]", icon: "text-[#54c89b]", label: "Task created" },
  TASK_UPDATED: { card: "border-[#6fa9ff]/20 bg-[#6fa9ff]/[0.035]", dot: "bg-[#6fa9ff]", icon: "text-[#6fa9ff]", label: "Task updated" },
  TASK_ASSIGNED: { card: "border-[#aab7ff]/25 bg-[#aab7ff]/[0.04]", dot: "bg-[#aab7ff]", icon: "text-[#aab7ff]", label: "Assignment changed" },
  TASK_STATUS_CHANGED: { card: "border-[#e7b65d]/25 bg-[#e7b65d]/[0.04]", dot: "bg-[#e7b65d]", icon: "text-[#e7b65d]", label: "Task status changed" },
  TASK_DELETED: { card: "border-[#ff7078]/25 bg-[#ff7078]/[0.04]", dot: "bg-[#ff7078]", icon: "text-[#ff8585]", label: "Task deleted" },
};

function metadataText(event: IncidentEvent, key: string, fallback = "item") {
  const value = event.metadata?.[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function statusTone(status: string) {
  const normalized = status.toUpperCase();
  if (["COMPLETED", "RESOLVED", "MITIGATED"].includes(normalized)) return "border-[#54c89b]/30 bg-[#54c89b]/10 text-[#72d6ad]";
  if (["IN_PROGRESS", "INVESTIGATING"].includes(normalized)) return "border-[#e7b65d]/30 bg-[#e7b65d]/10 text-[#e7b65d]";
  if (["TODO", "OPEN"].includes(normalized)) return "border-[#6fa9ff]/30 bg-[#6fa9ff]/10 text-[#8dbaff]";
  return "border-[#8993a1]/30 bg-[#8993a1]/10 text-[#aeb5bf]";
}

function StatusValue({ value }: { value: string }) {
  return <span className={`mx-1 inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusTone(value)}`}>{value.replaceAll("_", " ")}</span>;
}

function EventDescription({ event }: { event: IncidentEvent }) {
  const metadata = event.metadata ?? {};
  const taskTitle = metadataText(event, "task_title", "Untitled task");
  const memberName = metadataText(event, "member_name", "a member");

  switch (event.event_type) {
    case "INCIDENT_CREATED": return <>created the incident</>;
    case "INCIDENT_STATUS_CHANGED": return <>changed incident status from <StatusValue value={metadataText(event, "old_status", "unknown")} /> to <StatusValue value={metadataText(event, "new_status", "unknown")} /></>;
    case "INCIDENT_UPDATED": return <>updated incident details</>;
    case "MEMBER_ADDED": return <>added <span className="font-medium text-[#72d6ad]">{memberName}</span> to the incident</>;
    case "MEMBER_REMOVED": return <>removed <span className="font-medium text-[#ff8585]">{memberName}</span> from the incident</>;
    case "MEMBER_ROLE_UPDATED": return <>changed a member&apos;s role from <StatusValue value={metadataText(event, "old_role", "unknown")} /> to <StatusValue value={metadataText(event, "new_role", "unknown")} /></>;
    case "TASK_CREATED": return <>created task <span className="font-medium text-[#72d6ad]">“{taskTitle}”</span></>;
    case "TASK_UPDATED": return <>updated task <span className="font-medium text-[#8dbaff]">“{taskTitle}”</span></>;
    case "TASK_ASSIGNED": return <>changed the assignment for <span className="font-medium text-[#c0c8ff]">“{taskTitle}”</span></>;
    case "TASK_STATUS_CHANGED": return <>changed <span className="font-medium text-[#e9ebee]">“{taskTitle}”</span> from <StatusValue value={metadataText(event, "old_status", "unknown")} /> to <StatusValue value={metadataText(event, "new_status", "unknown")} /></>;
    case "TASK_DELETED": return <>deleted task <span className="font-medium text-[#ff8585]">“{taskTitle}”</span></>;
    case "INCIDENT_SEVERITY_CHANGED": return <>changed incident severity{typeof metadata.old_severity === "string" && typeof metadata.new_severity === "string" && <> from <StatusValue value={metadata.old_severity} /> to <StatusValue value={metadata.new_severity} /></>}</>;
    default: return <>performed an incident action</>;
  }
}

function EventIcon({ eventType, className }: { eventType: IncidentEventType; className: string }) {
  const iconProps = { size: 14, className };
  switch (eventType) {
    case "INCIDENT_CREATED":
    case "TASK_CREATED": return <Plus {...iconProps} />;
    case "MEMBER_ADDED": return <UserPlus {...iconProps} />;
    case "MEMBER_REMOVED": return <UserMinus {...iconProps} />;
    case "TASK_DELETED": return <Trash2 {...iconProps} />;
    case "INCIDENT_STATUS_CHANGED":
    case "TASK_STATUS_CHANGED": return <CircleDot {...iconProps} />;
    case "INCIDENT_SEVERITY_CHANGED": return <ShieldAlert {...iconProps} />;
    case "MEMBER_ROLE_UPDATED":
    case "TASK_ASSIGNED": return <ArrowRightLeft {...iconProps} />;
    case "INCIDENT_UPDATED":
    case "TASK_UPDATED": return <Pencil {...iconProps} />;
    default: return <Users {...iconProps} />;
  }
}

function formatEventDate(value: string) {
  const date = new Date(value);
  const now = new Date();
  const dateKey = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const todayKey = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const dayDifference = Math.round((todayKey - dateKey) / 86_400_000);
  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  if (dayDifference === 0) return `Today, ${time}`;
  if (dayDifference === 1) return `Yesterday, ${time}`;
  return date.toLocaleString();
}

const ActivityEventItem = ({ event, isLast = false }: { event: IncidentEvent; isLast?: boolean }) => {
  const tone = eventTones[event.event_type];

  return (
    <li className={`relative flex gap-3 ${isLast ? "pb-0" : "pb-5"}`}>
      {!isLast && <span aria-hidden="true" className="absolute bottom-[-0.75rem] left-[7px] top-3 w-px bg-[#343b46]" />}
      <span className={`relative z-10 mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ring-4 ring-[#0e1117] ${tone.dot}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-[#0e1117]" />
      </span>

      <article className={`min-w-0 flex-1 rounded-xl border px-4 py-3 ${tone.card}`}>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#090b0f]/50">
            <EventIcon eventType={event.event_type} className={tone.icon} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className={`text-[9px] font-semibold uppercase tracking-[0.14em] ${tone.icon}`}>{tone.label}</span>
              <time className="text-[10px] text-[#68717f]">{formatEventDate(event.created_at)}</time>
            </div>
            <p className="text-sm leading-6 text-[#aeb5bf]">
              <span className="font-semibold text-[#e9ebee]">{event.user_name ?? "System"}</span> <EventDescription event={event} />
            </p>
          </div>
        </div>
      </article>
    </li>
  );
};

export default ActivityEventItem;
