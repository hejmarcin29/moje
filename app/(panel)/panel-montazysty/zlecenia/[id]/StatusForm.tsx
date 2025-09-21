"use client";

import { useState, useTransition } from "react";
import type { OrderStatus } from "@prisma/client";
import { updateMyOrderAction } from "../actions";

type Props = {
  orderId: number;
  status: OrderStatus;
  notes: string | null;
};

export default function StatusForm({ orderId, status, notes }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3 rounded-lg border p-4"
      action={(fd) =>
        startTransition(async () => {
          setMessage(null);
          fd.set("id", String(orderId));
          const res = await updateMyOrderAction(fd);
          setMessage(res.error ?? (res.ok ? "Zapisano status." : null));
        })
      }
    >
      <div>
        <h2 className="text-lg font-medium">Status i notatka</h2>
        <p className="text-sm text-neutral-500">
          Zaktualizuj status zlecenia oraz zostaw krótką notatkę dla administratora.
        </p>
      </div>

      <div className="grid gap-1 sm:max-w-xs">
        <label className="text-sm">Status</label>
        <select name="status" defaultValue={status} className="rounded-md border px-2 py-1">
          <option value="NOWE">NOWE</option>
          <option value="W_TRAKCIE">W TRAKCIE</option>
          <option value="ZAKONCZONE">ZAKOŃCZONE</option>
          <option value="ANULOWANE">ANULOWANE</option>
        </select>
      </div>

      <div className="grid gap-1">
        <label className="text-sm">Notatka</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={notes ?? ""}
          placeholder="Wpisz dodatkowe informacje..."
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <button
        disabled={pending}
        className="rounded-md border px-4 py-2 font-medium hover:bg-neutral-50 disabled:opacity-60"
      >
        {pending ? "Zapisuję..." : "Zapisz"}
      </button>

      {message && <p className="text-sm text-red-600">{message}</p>}
    </form>
  );
}
