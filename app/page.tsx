"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // bezpieczna próba odczytu JSON
      let data: any = null;
      try { data = await res.json(); } catch {}

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Błędne dane");
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Błąd logowania");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border border-neutral-200 p-6 shadow-sm">
        <h1 className="mb-4 text-2xl font-semibold">Logowanie</h1>

        <label className="mb-2 block text-sm text-neutral-600" htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
          placeholder="email@domena.pl"
          required
        />

        <label className="mb-2 block text-sm text-neutral-600" htmlFor="password">Hasło</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
          placeholder="••••••••"
          required
        />

        <button
          disabled={busy}
          type="submit"
          className="w-full rounded-lg bg-black px-4 py-2 text-white transition active:scale-[.99] disabled:opacity-60"
        >
          {busy ? "Loguję…" : "Zaloguj"}
        </button>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </form>
    </main>
  );
}
