"use client";

import { FormEvent, useState } from "react";

import { useRouter } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import { api } from "@/lib/api";

import type { IncidentSeverity } from "@/types/incidentTypes";

export default function NewIncidentPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [severity, setSeverity] = useState<IncidentSeverity>("SEV3");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await api<{
        incident: {
          id: string;
        };
      }>("/incidents", {
        method: "POST",
        body: JSON.stringify({
          title,
          description: description || undefined,
          severity,
        }),
      });

      router.push(`/incidents/${response.incident.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create incident");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl p-5 sm:p-8">
        <button onClick={() => router.back()} className="mb-7 text-xs text-[#68717f] hover:text-[#dce0e5]">
          ← Back to incidents
        </button>

        <div className="mb-8">
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[#68717f]">New event</p>

          <h1 className="text-2xl font-semibold">Create incident</h1>

          <p className="mt-1 text-sm text-[#68717f]">Start coordinating a new operational event.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-[#252b35] bg-[#0e1117] p-6">
          <div className="space-y-6">
            <Input label="Incident title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Payment API degradation" required />

            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#68717f]">Description</span>

              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={6} placeholder="Describe what is happening..." className="w-full resize-none rounded-lg border border-[#252b35] bg-[#0e1117] px-3.5 py-3 text-sm text-[#f1f3f5] outline-none placeholder:text-[#505865] focus:border-[#5969c8] focus:ring-2 focus:ring-[#8b9cff]/10" />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#68717f]">Severity</span>

              <div className="grid grid-cols-4 gap-2">
                {(["SEV1", "SEV2", "SEV3", "SEV4"] as IncidentSeverity[]).map((level) => (
                  <button
                    type="button"
                    key={level}
                    onClick={() => setSeverity(level)}
                    className={`
                      rounded-lg border px-3 py-3
                      text-xs font-bold tracking-wider
                      transition
                      ${severity === level ? "border-[#8b9cff]/40 bg-[#8b9cff]/10 text-[#a4b0ff]" : "border-[#252b35] text-[#68717f] hover:bg-[#141820]"}
                    `}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </label>

            {error && <div className="rounded-lg border border-[#ff6262]/20 bg-[#ff6262]/5 p-3 text-sm text-[#ff7b7b]">{error}</div>}

            <div className="flex justify-end gap-2 border-t border-[#1b2028] pt-5">
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                Cancel
              </Button>

              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create incident"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
