"use client";

import { useState, useTransition } from "react";
import { TrimMode } from "@prisma/client";
import { saveMeasurementAction } from "../actions";

type Props = {
  orderId: number;
  orderAddress: string | null;
  selectedPanel: string | null;
  initialArea: string;
  measuredArea: string;
  measurement: {
    trimMode: TrimMode;
    installationAddress: string;
    panelName: string;
    measuredArea: string;
    wastePercentage: number;
    installationDate: string | null;
    deliveryDate: string | null;
    deliveryOffsetDays: number | null;
    carryNote: string | null;
  } | null;
};

export default function MeasurementForm(props: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<TrimMode>(props.measurement?.trimMode ?? TrimMode.WITH_PANELS);

  const installationAddress = props.measurement?.installationAddress ?? props.orderAddress ?? "";
  const panelName = props.measurement?.panelName ?? props.selectedPanel ?? "";
  const measuredAreaDefault = props.measurement?.measuredArea ?? "";
  const wastePercentageDefault = props.measurement?.wastePercentage?.toString() ?? "10";
  const installationDateDefault = props.measurement?.installationDate ?? null;
  const deliveryDateDefault = props.measurement?.deliveryDate ?? null;
  const deliveryOffsetDefault = props.measurement?.deliveryOffsetDays?.toString() ?? "";
  const carryNoteDefault = props.measurement?.carryNote ?? "";

  return (
    <form
      className="space-y-4 rounded-lg border p-4"
      action={(fd) =>
        startTransition(async () => {
          setMessage(null);
          fd.set("orderId", String(props.orderId));
          const res = await saveMeasurementAction(fd);
          setMessage(res.error ?? (res.ok ? "Pomiar zapisany." : null));
        })
      }
    >
      <div className="space-y-1">
        <h2 className="text-lg font-medium">Pomiar</h2>
        <p className="text-sm text-neutral-500">
          Potwierdź adres montażu i zapisz wynik pomiaru paneli. Sekcja „Pomiar listwy” będzie dostępna później.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-1 sm:col-span-2">
          <label className="text-sm">Adres montażu</label>
          <textarea
            name="installationAddress"
            required
            defaultValue={installationAddress}
            rows={2}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-sm">Listwy</label>
          <select
            name="trimMode"
            value={mode}
            onChange={(e) => setMode(e.target.value as TrimMode)}
            className="w-full rounded-md border px-3 py-2"
          >
            <option value={TrimMode.WITH_PANELS}>Razem z panelami</option>
            <option value={TrimMode.SEPARATE}>Osobno</option>
          </select>
        </div>
        <div className="grid gap-1">
          <label className="text-sm">Wstępny metraż</label>
          <input
            value={props.initialArea}
            readOnly
            className="w-full rounded-md border bg-neutral-100 px-3 py-2 text-neutral-500"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-sm">Ostatni pomiar</label>
          <input
            value={props.measuredArea}
            readOnly
            className="w-full rounded-md border bg-neutral-100 px-3 py-2 text-neutral-500"
          />
        </div>
      </div>

      <fieldset className="space-y-3 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">Pomiar panele</legend>
        <p className="text-xs text-neutral-500">
          Potwierdź panel wybrany przez klienta lub wpisz nowy. Podaj wynik pomiaru wraz z zapasem na docinki.
        </p>

        <div className="grid gap-1">
          <label className="text-sm">Panel</label>
          <input
            name="panelName"
            defaultValue={panelName}
            placeholder="Panel Dąb Naturalny"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <label className="text-sm">Pomiar (m²)</label>
            <input
              name="measuredArea"
              type="number"
              min="0"
              step="0.01"
              defaultValue={measuredAreaDefault}
              className="w-full rounded-md border px-3 py-2"
              required
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm">Zapas na docinki (%)</label>
            <input
              name="wastePercentage"
              type="number"
              min="5"
              max="20"
              defaultValue={wastePercentageDefault}
              className="w-full rounded-md border px-3 py-2"
              required
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="grid gap-1">
            <label className="text-sm">Termin montażu</label>
            <input
              name="installationDate"
              type="date"
              defaultValue={installationDateDefault ?? undefined}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm">Termin dostawy paneli</label>
            <input
              name="deliveryDate"
              type="date"
              defaultValue={deliveryDateDefault ?? undefined}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm">Ile dni wcześniej?</label>
            <input
              name="deliveryOffsetDays"
              type="number"
              min="0"
              defaultValue={deliveryOffsetDefault}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        </div>

        <div className="grid gap-1">
          <label className="text-sm">Wnoszenie</label>
          <textarea
            name="carryNote"
            rows={2}
            placeholder="Np. 4 piętro bez windy"
            defaultValue={carryNoteDefault}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center rounded-md border px-4 py-2 font-medium hover:bg-neutral-50 disabled:opacity-60"
          >
            {pending ? "Zapisuję..." : "Zapisz pomiar"}
          </button>
          {mode === TrimMode.SEPARATE && (
            <button
              type="button"
              disabled
              className="inline-flex items-center rounded-md border border-dashed px-4 py-2 text-neutral-400"
            >
              Pomiar listwy (w przygotowaniu)
            </button>
          )}
        </div>
      </fieldset>

      {message && <p className="text-sm text-red-600">{message}</p>}
    </form>
  );
}
