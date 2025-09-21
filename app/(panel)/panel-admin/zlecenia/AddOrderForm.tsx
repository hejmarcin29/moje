"use client";

import { useState, useTransition } from "react";
import { createOrderAction } from "./actions";

type Monter = { id: number; firstName: string | null; email: string };

export default function AddOrderForm({ monters }: { monters: Monter[] }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      action={(fd) =>
        start(async () => {
          setMsg(null);
          const res = await createOrderAction(fd);
          setMsg(res.error ?? (res.ok ? "Zlecenie dodane." : null));
        })
      }
      className="space-y-4 max-w-xl rounded-lg border p-4"
    >
      <h2 className="text-lg font-medium">Dodaj zlecenie</h2>

      <div className="grid gap-1">
        <label className="text-sm">Klient</label>
        <input
          name="customerName"
          required
          className="w-full rounded-md border px-3 py-2"
          placeholder="Jan Kowalski"
        />
      </div>

      <div className="grid gap-1">
        <label className="text-sm">Miasto</label>
        <input
          name="city"
          required
          className="w-full rounded-md border px-3 py-2"
          placeholder="Warszawa"
        />
      </div>

      <div className="grid gap-1">
        <label className="text-sm">Telefon</label>
        <input
          name="phone"
          required
          className="w-full rounded-md border px-3 py-2"
          placeholder="600 000 000"
        />
      </div>

      <div className="grid gap-1">
        <label className="text-sm">Adres</label>
        <input name="address" className="w-full rounded-md border px-3 py-2" />
      </div>

      <div className="grid gap-1">
        <label className="text-sm">Wstępny metraż (m²)</label>
        <input
          name="initialArea"
          type="number"
          min="0"
          step="0.01"
          required
          className="w-full rounded-md border px-3 py-2"
          placeholder="45"
        />
      </div>

      <div className="grid gap-1">
        <label className="text-sm">Wybrany panel</label>
        <input
          name="selectedPanel"
          className="w-full rounded-md border px-3 py-2"
          placeholder="Panel Dąb Naturalny"
        />
      </div>

      <div className="grid gap-1">
        <label className="text-sm">Notatka dla montera</label>
        <textarea
          name="notes"
          rows={3}
          className="w-full rounded-md border px-3 py-2"
          placeholder="Dodatkowe informacje od klienta"
        />
      </div>

      <div className="grid gap-1">
        <label className="text-sm">Planowana data</label>
        <input name="plannedDate" type="date" className="w-full rounded-md border px-3 py-2" />
      </div>

      <div className="grid gap-1">
        <label className="text-sm">Przypisz montera</label>
        <select name="assignedToId" className="w-full rounded-md border px-3 py-2">
          <option value="">— brak —</option>
          {monters.map((m) => (
            <option key={m.id} value={m.id}>
              {m.firstName ?? m.email} ({m.email})
            </option>
          ))}
        </select>
      </div>

      <button disabled={pending} className="rounded-md border px-4 py-2 font-medium hover:bg-neutral-50 disabled:opacity-60">
        {pending ? "Dodaję..." : "Dodaj zlecenie"}
      </button>

      {msg && <p className="text-sm text-red-600">{msg}</p>}
    </form>
  );
}
