"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { registerUser } from "@/api/auth.api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      // Registration currently returns a user, not an access token.
      // Send the user to login to establish an authenticated session.
      router.push("/login?registered=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ops-grid flex min-h-screen items-center justify-center bg-[#090b0f] px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="mb-6 flex h-9 w-9 items-center justify-center rounded-lg bg-[#f1f3f5] text-sm font-bold text-[#090b0f]">O</div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#68717f]">Operations platform</p>

          <h1 className="text-3xl font-semibold tracking-tight">Create your account.</h1>

          <p className="mt-2 text-sm leading-6 text-[#68717f]">Set up your account to coordinate and resolve incidents with your team.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-[#252b35] bg-[#0e1117] p-6">
          <div className="space-y-5">
            <Input label="Full name" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" minLength={2} maxLength={50} required />

            <Input label="Email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required />

            <Input label="Password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" minLength={6} maxLength={100} required />

            <Input label="Confirm password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Re-enter your password" required />

            {error && (
              <div role="alert" className="rounded-lg border border-[#ff6262]/20 bg-[#ff6262]/5 px-3 py-2.5 text-sm text-[#ff7b7b]">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-[#68717f]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#f1f3f5] transition-colors hover:text-white">
            Sign in
          </Link>
        </p>

        <p className="mt-5 text-center text-xs text-[#505865]">OpsPulse · Incident response</p>
      </div>
    </main>
  );
}
