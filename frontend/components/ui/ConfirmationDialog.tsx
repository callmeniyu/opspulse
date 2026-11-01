"use client";

import { AlertTriangle } from "lucide-react";

export function ConfirmationDialog({ title, message, confirmLabel = "Yes", cancelLabel = "No", busy = false, onConfirm, onCancel }: { title: string; message: string; confirmLabel?: string; cancelLabel?: string; busy?: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center overflow-y-auto bg-black/65 p-0 sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onCancel(); }}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="confirmation-title" aria-describedby="confirmation-message" className="my-auto w-full rounded-t-2xl border border-[#343b46] bg-[#0e1117] p-5 shadow-2xl sm:max-w-md sm:rounded-2xl">
        <div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e7b65d]/10 text-[#e7b65d]"><AlertTriangle size={18} /></span><div><h2 id="confirmation-title" className="text-base font-semibold text-[#f1f3f5]">{title}</h2><p id="confirmation-message" className="mt-1 text-sm leading-5 text-[#8993a1]">{message}</p></div></div>
        <div className="mt-6 flex justify-end gap-2"><button type="button" disabled={busy} onClick={onCancel} className="rounded-lg px-3 py-2 text-sm text-[#aeb5bf] hover:bg-[#1a202a] disabled:opacity-50">{cancelLabel}</button><button type="button" disabled={busy} onClick={onConfirm} className="rounded-lg bg-[#f1f3f5] px-3.5 py-2 text-sm font-semibold text-[#090b0f] hover:bg-white disabled:opacity-50">{confirmLabel}</button></div>
      </section>
    </div>
  );
}
