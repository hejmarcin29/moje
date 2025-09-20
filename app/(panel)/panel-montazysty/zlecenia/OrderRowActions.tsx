"use client";

import { useState, useTransition } from "react";
import { updateMyOrderAction } from "./actions";
import type { OrderStatus } from "@prisma/client";

export default function OrderRowActions(props: {
  id: number;
  status: OrderStatus;
  notes: string | null;
}) {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <td className="px-3 py-2">
      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
        action={(fd) =>
          start(async () => {
            setMsg(null);
            fd.set("id", String(props.id));
            const res = await updateMyOrderAction(fd);
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

        <textarea
          name="notes"
          rows={1}
          defaultValue={props.notes ?? ""}
          placeholder="Notatka (opcjonalnie)"
          className="min-w-[220px] flex-1 rounded-md border px-2 py-1"
        />

        <button
          disabled={pending}
          className="rounded-md border px-3 py-1 hover:bg-neutral-50 disabled:opacity-60"
        >
          {pending ? "Zapisuję..." : "Zapisz"}
        </button>
      </form>

      {msg && <p className="mt-1 text-xs text-red-600">{msg}</p>}
    </td>
  );
}
