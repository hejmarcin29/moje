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
  customerName: string;
  city: string;
  phone: string;
  address: string;
  initialArea: number | undefined;
  selectedPanel: string;
  notes: string;
}) {
  const [msg, setMsg] = useState<string | null>(null);
  const [detailsMsg, setDetailsMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <td className="px-3 py-2 space-y-4">
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

      {/* Szczegóły */}
      <form
        className="grid gap-2"
        action={(fd) =>
          start(async () => {
            setDetailsMsg(null);
            fd.set("id", String(props.id));
            const res = await updateOrderAction(fd);
            setDetailsMsg(res.error ?? (res.ok ? "Zapisano." : null));
          })
        }
      >
        <div className="grid gap-1">
          <label className="text-xs uppercase tracking-wide text-neutral-500">Klient</label>
          <input
            name="customerName"
            defaultValue={props.customerName}
            className="rounded-md border px-2 py-1"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs uppercase tracking-wide text-neutral-500">Miasto</label>
          <input name="city" defaultValue={props.city} className="rounded-md border px-2 py-1" />
        </div>
        <div className="grid gap-1">
          <label className="text-xs uppercase tracking-wide text-neutral-500">Telefon</label>
          <input name="phone" defaultValue={props.phone} className="rounded-md border px-2 py-1" />
        </div>
        <div className="grid gap-1">
          <label className="text-xs uppercase tracking-wide text-neutral-500">Adres</label>
          <input name="address" defaultValue={props.address} className="rounded-md border px-2 py-1" />
        </div>
        <div className="grid gap-1">
          <label className="text-xs uppercase tracking-wide text-neutral-500">Wstępny metraż (m²)</label>
          <input
            name="initialArea"
            type="number"
            step="0.01"
            min="0"
            defaultValue={props.initialArea ?? ""}
            className="rounded-md border px-2 py-1"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs uppercase tracking-wide text-neutral-500">Panel</label>
          <input name="selectedPanel" defaultValue={props.selectedPanel} className="rounded-md border px-2 py-1" />
        </div>
        <div className="grid gap-1">
          <label className="text-xs uppercase tracking-wide text-neutral-500">Notatka</label>
          <textarea
            name="notes"
            rows={2}
            defaultValue={props.notes}
            className="rounded-md border px-2 py-1"
          />
        </div>
        <button disabled={pending} className="rounded-md border px-2 py-1 disabled:opacity-60 hover:bg-neutral-50">
          Zapisz dane
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
      {detailsMsg && <p className="text-xs text-red-600">{detailsMsg}</p>}
    </td>
  );
}
