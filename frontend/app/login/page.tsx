"use client";

import { SubmitEvent, useState } from "react";

import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { loginSuccess } from "@/store/slices/authSlice";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      dispatch(
        loginSuccess({
          user: response.user,
        }),
      );

      router.push("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ops-grid flex min-h-screen items-center justify-center bg-[#090b0f] px-5">
      <div className="w-full max-w-md">
        <div className="mb-10">
          <div className="mb-6 flex h-9 w-9 items-center justify-center rounded-lg bg-[#f1f3f5] text-sm font-bold text-[#090b0f]">O</div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#68717f]">Operations platform</p>

          <h1 className="text-3xl font-semibold tracking-tight">Welcome back.</h1>

          <p className="mt-2 text-sm leading-6 text-[#68717f]">Sign in to monitor and coordinate active incidents.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-[#252b35] bg-[#0e1117] p-6">
          <div className="space-y-5">
            <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required />

            <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required />

            {error && <div className="rounded-lg border border-[#ff6262]/20 bg-[#ff6262]/5 px-3 py-2.5 text-sm text-[#ff7b7b]">{error}</div>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </form>

        <p className="mt-5 text-center text-xs text-[#505865]">OpsPulse · Incident response</p>
      </div>
    </main>
  );
}
