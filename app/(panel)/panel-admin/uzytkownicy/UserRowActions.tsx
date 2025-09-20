"use client";

import { useState, useTransition } from "react";
import { updateUserAction, toggleActiveAction, resetPasswordAction } from "./actions";
import type { Role } from "@prisma/client";

export default function UserRowActions(props: {
  id: number;
  firstName: string | null;
  role: Role;
  isActive: boolean;
}) {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <td className="px-3 py-2 space-y-2">
      {/* Edycja imienia + roli */}
      <form
        className="flex items-center gap-2"
        action={(fd) =>
          start(async () => {
            setMsg(null);
            fd.set("id", String(props.id));
            const res = await updateUserAction(fd);
            setMsg(res.error ?? (res.ok ? "Zapisano." : null));
          })
        }
      >
        <input type="hidden" name="id" value={props.id} />
        <input
          name="firstName"
          defaultValue={props.firstName ?? ""}
          placeholder="Imię"
          className="rounded-md border px-2 py-1"
        />
        <select name="role" defaultValue={props.role} className="rounded-md border px-2 py-1">
          <option value="MONTAZYSTA">MONTAŻYSTA</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button disabled={pending} className="rounded-md border px-2 py-1 hover:bg-neutral-50 disabled:opacity-60">
          Zapisz
        </button>
      </form>

      {/* Aktywacja/dezaktywacja */}
      <form
        action={() =>
          start(async () => {
            setMsg(null);
            const fd = new FormData();
            fd.set("id", String(props.id));
            fd.set("active", String(props.isActive));
            const res = await toggleActiveAction(fd);
            setMsg(res.error ?? (res.ok ? (props.isActive ? "Dezaktywowano." : "Aktywowano.") : null));
          })
        }
      >
        <button disabled={pending} className="rounded-md border px-2 py-1 hover:bg-neutral-50 disabled:opacity-60">
          {props.isActive ? "Dezaktywuj" : "Aktywuj"}
        </button>
      </form>

      {/* Reset hasła */}
      <form
        className="flex gap-2"
        action={(fd) =>
          start(async () => {
            setMsg(null);
            fd.set("id", String(props.id));
            const res = await resetPasswordAction(fd);
            setMsg(res.error ?? (res.ok ? "Hasło ustawione." : null));
          })
        }
      >
        <input name="password" type="password" placeholder="Nowe hasło" minLength={8} className="rounded-md border px-2 py-1" />
        <input name="password2" type="password" placeholder="Powtórz" minLength={8} className="rounded-md border px-2 py-1" />
        <button disabled={pending} className="rounded-md border px-2 py-1 hover:bg-neutral-50 disabled:opacity-60">
          Reset
        </button>
      </form>

      {msg && <p className="text-xs text-red-600">{msg}</p>}
    </td>
  );
}
