"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import { IncidentSidebar } from "@/components/incidents/IncidentSidebar";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mainNavigationOpen, setMainNavigationOpen] = useState(false);
  const incidentMatch = pathname.match(/^\/incidents\/([^/]+)$/);
  const isIncidentWorkspace = Boolean(incidentMatch);

  return (
    <div className="flex min-h-screen bg-[#090b0f]">
      {isIncidentWorkspace ? (
        <div className="relative hidden w-60 shrink-0 md:block" onMouseLeave={() => setMainNavigationOpen(false)}>
          <IncidentSidebar incidentId={incidentMatch![1]} onOpenMainNavigation={setMainNavigationOpen} />

          <div className={`fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out ${mainNavigationOpen ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-4 opacity-0"}`}>
            <Sidebar fixed={false} />
          </div>
        </div>
      ) : (
        <div className="hidden w-60 shrink-0 md:block">
          <Sidebar />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="ops-grid min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
