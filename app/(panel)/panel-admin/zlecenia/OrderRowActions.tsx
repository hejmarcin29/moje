"use client";

import { useState, useTransition } from "react";
import { assignOrderAction, updateOrderAction, deleteOrderAction } from "./actions";
import type { OrderStatus } from "@prisma/client";

type Monter = { id: number; firstName: string | null; email: string };

export default function OrderRowActions(props: {
  id: number;
  status: OrderStatus;
  plannedDate: string | null; // YYYY-MM-DD
  assignedToId: number | null;
  monters: Monter[];
}) {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <td className="px-3 py-2 space-y-2">
      {/* Status + data */}
      <form
        className="flex items-center gap-2"
        action={(fd) =>
          start(async () => {
            setMsg(null);
            fd.set("id", String(props.id));
            const res = await updateOrderAction(fd);
            setMsg(res.error ?? (res.ok ? "Zapisano." : null));
          })
        }
      >
        <select name="status" defaultValue={props.status} className="rounded-md border px-2 py-1">
          <option value="NOWE">NOWE</option>
          <option value="W_TRAKCIE">W TRAKCIE</option>
          <option value="ZAKONCZONE">ZAKOŃCZONE</option>
          <option value="ANULOWANE">ANULOWANE</option>
        </select>
        <input name="plannedDate" type="date" defaultValue={props.plannedDate ?? undefined} className="rounded-md border px-2 py-1" />
        <button disabled={pending} className="rounded-md border px-2 py-1 disabled:opacity-60 hover:bg-neutral-50">
          Zapisz
        </button>
      </form>

      {/* Przypisz montera */}
      <form
        className="flex items-center gap-2"
        action={(fd) =>
          start(async () => {
            setMsg(null);
            fd.set("id", String(props.id));
            const res = await assignOrderAction(fd);
            setMsg(res.error ?? (res.ok ? "Zapisano." : null));
          })
        }
      >
        <select name="assignedToId" defaultValue={props.assignedToId ?? ""} className="rounded-md border px-2 py-1">
          <option value="">— brak —</option>
          {props.monters.map((m) => (
            <option key={m.id} value={m.id}>
              {m.firstName ?? m.email} ({m.email})
            </option>
          ))}
        </select>
        <button disabled={pending} className="rounded-md border px-2 py-1 disabled:opacity-60 hover:bg-neutral-50">
          Przypisz
        </button>
      </form>

      {/* Usuń */}
      <form
        action={() =>
          start(async () => {
            setMsg(null);
            const fd = new FormData();
            fd.set("id", String(props.id));
            const res = await deleteOrderAction(fd);
            setMsg(res.error ?? (res.ok ? "Usunięto." : null));
          })
        }
      >
        <button disabled={pending} className="rounded-md border px-2 py-1 text-red-600 hover:bg-red-50 disabled:opacity-60">
          Usuń
        </button>
      </form>

      {msg && <p className="text-xs text-red-600">{msg}</p>}
    </td>
  );
}
