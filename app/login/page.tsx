"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setErr(data?.error || "Błędny email lub hasło");
        return;
      }
      // na razie bez sesji – po prostu przenieś na dashboard
      router.push("/dashboard");
    } catch {
      setErr("Błąd połączenia");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "48px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Logowanie</h1>
      <form onSubmit={onSubmit}>
        <label style={{ display: "block", marginBottom: 12 }}>
          Email
          <input
            type="email"
            style={{ width: "100%", padding: 8, marginTop: 6 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="np. jan.kowalski@example.com"
            required
            autoFocus
          />
        </label>
        <label style={{ display: "block", marginBottom: 12 }}>
          Hasło
          <input
            type="password"
            style={{ width: "100%", padding: 8, marginTop: 6 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Wpisz swoje hasło"
            required
          />
        </label>
        <button disabled={loading} style={{ padding: "10px 16px" }}>
          {loading ? "Loguję..." : "Zaloguj"}
        </button>
      </form>
      {err && <p style={{ color: "crimson", marginTop: 12 }}>{err}</p>}
    </main>
  );
}
