"use client"

import { useState, useTransition } from "react"
import { TrimMode } from "@prisma/client"
import { saveMeasurementAction } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
}

export default function MeasurementForm(props: Props) {
  const [message, setMessage] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [mode, setMode] = useState<TrimMode>(props.measurement?.trimMode ?? TrimMode.WITH_PANELS)

  const installationAddress = props.measurement?.installationAddress ?? props.orderAddress ?? ""
  const panelName = props.measurement?.panelName ?? props.selectedPanel ?? ""
  const measuredAreaDefault = props.measurement?.measuredArea ?? ""
  const wastePercentageDefault = props.measurement?.wastePercentage?.toString() ?? "10"
  const installationDateDefault = props.measurement?.installationDate ?? null
  const deliveryDateDefault = props.measurement?.deliveryDate ?? null
  const deliveryOffsetDefault = props.measurement?.deliveryOffsetDays?.toString() ?? ""
  const carryNoteDefault = props.measurement?.carryNote ?? ""

  return (
    <form
      className="space-y-4 rounded-lg border p-4"
      action={(fd) =>
        startTransition(async () => {
          setMessage(null)
          fd.set("orderId", String(props.orderId))
          fd.set("trimMode", mode)
          const res = await saveMeasurementAction(fd)
          setMessage(res.error ?? (res.ok ? "Pomiar zapisany." : null))
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
          <Label htmlFor="installation-address" className="text-sm">
            Adres montażu
          </Label>
          <Textarea
            id="installation-address"
            name="installationAddress"
            required
            defaultValue={installationAddress}
            rows={2}
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="trim-mode" className="text-sm">
            Listwy
          </Label>
          <Select value={mode} onValueChange={(value) => setMode(value as TrimMode)}>
            <SelectTrigger id="trim-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TrimMode.WITH_PANELS}>Razem z panelami</SelectItem>
              <SelectItem value={TrimMode.SEPARATE}>Osobno</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="trimMode" value={mode} />
        </div>
        <div className="grid gap-1">
          <Label className="text-sm" htmlFor="initial-area-readonly">
            Wstępny metraż
          </Label>
          <Input
            id="initial-area-readonly"
            value={props.initialArea}
            readOnly
            className="bg-neutral-100 text-neutral-500"
          />
        </div>
        <div className="grid gap-1">
          <Label className="text-sm" htmlFor="measured-area-readonly">
            Ostatni pomiar
          </Label>
          <Input
            id="measured-area-readonly"
            value={props.measuredArea}
            readOnly
            className="bg-neutral-100 text-neutral-500"
          />
        </div>
      </div>

      <fieldset className="space-y-3 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">Pomiar panele</legend>
        <p className="text-xs text-neutral-500">
          Potwierdź panel wybrany przez klienta lub wpisz nowy. Podaj wynik pomiaru wraz z zapasem na docinki.
        </p>

        <div className="grid gap-1">
          <Label htmlFor="panel-name" className="text-sm">
            Panel
          </Label>
          <Input
            id="panel-name"
            name="panelName"
            defaultValue={panelName}
            placeholder="Panel Dąb Naturalny"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label htmlFor="measured-area" className="text-sm">
              Pomiar (m²)
            </Label>
            <Input
              id="measured-area"
              name="measuredArea"
              type="number"
              min="0"
              step="0.01"
              defaultValue={measuredAreaDefault}
              required
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="waste-percentage" className="text-sm">
              Zapas na docinki (%)
            </Label>
            <Input
              id="waste-percentage"
              name="wastePercentage"
              type="number"
              min="5"
              max="20"
              defaultValue={wastePercentageDefault}
              required
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="grid gap-1">
            <Label htmlFor="installation-date" className="text-sm">
              Termin montażu
            </Label>
            <Input
              id="installation-date"
              name="installationDate"
              type="date"
              defaultValue={installationDateDefault ?? undefined}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="delivery-date" className="text-sm">
              Termin dostawy paneli
            </Label>
            <Input
              id="delivery-date"
              name="deliveryDate"
              type="date"
              defaultValue={deliveryDateDefault ?? undefined}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="delivery-offset" className="text-sm">
              Ile dni wcześniej?
            </Label>
            <Input
              id="delivery-offset"
              name="deliveryOffsetDays"
              type="number"
              min="0"
              defaultValue={deliveryOffsetDefault}
            />
          </div>
        </div>

        <div className="grid gap-1">
          <Label htmlFor="carry-note" className="text-sm">
            Wnoszenie
          </Label>
          <Textarea
            id="carry-note"
            name="carryNote"
            rows={2}
            placeholder="Np. 4 piętro bez windy"
            defaultValue={carryNoteDefault}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="submit" disabled={pending} className="font-medium">
            {pending ? "Zapisuję..." : "Zapisz pomiar"}
          </Button>
          {mode === TrimMode.SEPARATE && (
            <Button type="button" variant="outline" disabled className="border-dashed text-neutral-400">
              Pomiar listwy (w przygotowaniu)
            </Button>
          )}
        </div>
      </fieldset>

      {message && <p className="text-sm text-destructive">{message}</p>}
    </form>
  )
}
