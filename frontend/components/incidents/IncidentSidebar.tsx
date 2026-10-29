"use client";

import Link from "next/link";
import { Activity, ArrowLeft, CheckCircle2, ClipboardList, ListTodo, PanelLeftOpen, MessageSquare, ShieldAlert, Users } from "lucide-react";

type Props = {
  incidentId: string;
  onOpenMainNavigation: (value: boolean) => void;
};

const workspaceNavigation = [
  { label: "Overview", href: "#overview", icon: ShieldAlert },
  { label: "Activity", href: "#war-room", icon: Activity },
  { label: "Conversation", href: "#war-room", icon: MessageSquare },
  { label: "Response tasks", href: "#response-tasks", icon: ListTodo },
  { label: "Responders", href: "#responders", icon: Users },
  { label: "Incident details", href: "#incident-details", icon: ClipboardList },
  { label: "Resolution", href: "#resolution", icon: CheckCircle2 },
];

export function IncidentSidebar({ incidentId, onOpenMainNavigation }: Props) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden h-screen w-60 shrink-0 border-r border-[#1b2028] bg-[#0b0e13] md:flex md:flex-col">
      <div className="flex h-16 items-center border-b border-[#1b2028] px-4">
        <button type="button" onMouseEnter={() => onOpenMainNavigation(true)} onFocus={() => onOpenMainNavigation(true)} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-[#aeb5bf] transition hover:bg-[#141820] hover:text-[#f1f3f5] cursor-pointer" aria-label="Show main navigation">
          <PanelLeftOpen size={16} />
          <span className="text-sm font-semibold tracking-wide">OpsPulse</span>
        </button>
      </div>

      <div className="border-b border-[#1b2028] px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#68717f]">Incident workspace</p>
        <p className="mt-2 truncate text-sm font-medium text-[#dce0e5]">Incident {incidentId}</p>
      </div>

      <nav className="flex-1 px-3 py-5" aria-label="Incident workspace navigation">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#505865]">Workspace</p>
        <div className="space-y-1">
          {workspaceNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <a key={item.label} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#78818e] transition hover:bg-[#11151c] hover:text-[#dce0e5]">
                <Icon size={16} strokeWidth={1.7} />
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-[#1b2028] p-3">
        <Link href="/incidents" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#8993a1] transition hover:bg-[#11151c] hover:text-[#dce0e5]">
          <ArrowLeft size={16} />
          All incidents
        </Link>
      </div>
    </aside>
  );
}
