"use client";

import { useState, useTransition } from "react";
import { createUserAction } from "./actions";

export default function AddUserForm() {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={async (fd) => {
        setMsg(null);
        startTransition(async () => {
          const res = await createUserAction(fd);
          setMsg(res.error ?? (res.ok ? "Użytkownik dodany." : null));
        });
      }}
      className="space-y-4 max-w-md rounded-lg border p-4"
    >
      <h2 className="text-lg font-medium">Dodaj użytkownika</h2>

      <div className="grid gap-1">
        <label className="text-sm">E-mail</label>
        <input name="email" type="email" required className="w-full rounded-md border px-3 py-2" placeholder="user@primepodloga.pl" />
      </div>

      <div className="grid gap-1">
        <label className="text-sm">Imię (opcjonalnie)</label>
        <input name="firstName" type="text" className="w-full rounded-md border px-3 py-2" />
      </div>

      <div className="grid gap-1">
        <label className="text-sm">Rola</label>
        <select name="role" className="w-full rounded-md border px-3 py-2">
          <option value="MONTAZYSTA">MONTAŻYSTA</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>

      <div className="grid gap-1">
        <label className="text-sm">Hasło</label>
        <input name="password" type="password" required minLength={8} className="w-full rounded-md border px-3 py-2" />
      </div>

      <div className="grid gap-1">
        <label className="text-sm">Powtórz hasło</label>
        <input name="password2" type="password" required minLength={8} className="w-full rounded-md border px-3 py-2" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md border px-4 py-2 font-medium hover:bg-neutral-50 disabled:opacity-60"
      >
        {pending ? "Dodaję..." : "Dodaj"}
      </button>

      {msg && <p className="text-sm text-red-600">{msg}</p>}
    </form>
  );
}
