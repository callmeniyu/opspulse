"use client";

import { Search } from "lucide-react";

import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

export function Topbar() {
  const dispatch = useAppDispatch();

  function handleLogout() {
    dispatch(logout());
    window.location.href = "/login";
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#1b2028] bg-[#090b0f]/95 px-5 backdrop-blur">
      <div className="relative hidden w-72 sm:block">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#505865]" />

        <input placeholder="Search incidents..." className="h-9 w-full rounded-lg border border-[#1b2028] bg-[#0e1117] pl-9 pr-3 text-sm text-[#dce0e5] outline-none placeholder:text-[#505865] focus:border-[#343c4a]" />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-[#9ca4b1] hover:bg-[#141820] hover:text-[#f1f3f5]">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#252b35] text-xs font-semibold">N</span>

          <span className="hidden sm:block">Nick</span>
        </button>
      </div>
    </header>
  );
}
