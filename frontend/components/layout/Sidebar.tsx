"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Activity, AlertTriangle, CheckSquare, Users, Settings } from "lucide-react";

const navigation = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: Activity,
  },
  {
    label: "Incidents",
    href: "/incidents",
    icon: AlertTriangle,
  },
  {
    label: "Tasks",
    href: "/dashboard?view=tasks",
    icon: CheckSquare,
  },
  {
    label: "Team",
    href: "/dashboard?view=team",
    icon: Users,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-[#1b2028] bg-[#0b0e13] md:flex md:flex-col">
      <div className="flex h-16 items-center border-b border-[#1b2028] px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#f1f3f5] text-xs font-bold text-[#090b0f]">O</div>

          <span className="text-sm font-semibold tracking-wide">OpsPulse</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5">
        <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#505865]">Operations</div>

        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            const active = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`
                  group flex items-center gap-3
                  rounded-lg px-3 py-2.5
                  text-sm transition
                  ${active ? "bg-[#141820] text-[#f1f3f5]" : "text-[#78818e] hover:bg-[#11151c] hover:text-[#dce0e5]"}
                `}
              >
                <Icon size={16} strokeWidth={1.7} />

                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-[#1b2028] p-3">
        <Link href="/dashboard?view=settings" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#68717f] hover:bg-[#11151c] hover:text-[#dce0e5]">
          <Settings size={16} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
