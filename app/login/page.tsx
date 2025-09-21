"use client";
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) {
        setErr(data?.error || "Błędny email lub hasło")
        return
      }
      // na razie bez sesji – po prostu przenieś na dashboard
      router.push("/dashboard")
    } catch {
      setErr("Błąd połączenia")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">Logowanie</h1>
        <p className="text-sm text-muted-foreground">Uzyskaj dostęp do panelu administracyjnego.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border p-6 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="np. jan.kowalski@example.com"
            required
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-password">Hasło</Label>
          <Input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Wpisz swoje hasło"
            required
          />
        </div>
        <Button disabled={loading} type="submit">
          {loading ? "Loguję..." : "Zaloguj"}
        </Button>
      </form>
      {err && <p className="text-sm text-destructive">{err}</p>}
    </main>
  )
}
