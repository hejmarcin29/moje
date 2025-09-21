"use client";
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type LoginResponse = {
  ok?: boolean;
  error?: string;
};

function isLoginResponse(value: unknown): value is LoginResponse {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as { ok?: unknown; error?: unknown };
  if (typeof candidate.ok !== "undefined" && typeof candidate.ok !== "boolean") {
    return false;
  }
  if (typeof candidate.error !== "undefined" && typeof candidate.error !== "string") {
    return false;
  }
  return true;
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      // bezpieczna próba odczytu JSON
      let data: unknown = null;
      try {
        data = await res.json()
      } catch {
        data = null
      }

      const payload = isLoginResponse(data) ? data : null

      if (!res.ok || payload?.ok !== true) {
        throw new Error(payload?.error || "Błędne dane")
      }
      router.push("/dashboard")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : null
      setError(message || "Błąd logowania")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-2xl border border-neutral-200 p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold">Logowanie</h1>
          <p className="text-sm text-neutral-500">Zaloguj się do panelu firmowego.</p>
        </div>

        <div className="space-y-2">
          <Label className="text-neutral-600" htmlFor="email">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@domena.pl"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-neutral-600" htmlFor="password">
            Hasło
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <Button disabled={busy} type="submit" className="w-full">
          {busy ? "Loguję…" : "Zaloguj"}
        </Button>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </main>
  )
}
