"use client"

import { useState, useTransition } from "react"
import { createOrderAction } from "./actions"
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

type Monter = { id: number; firstName: string | null; email: string }

export default function AddOrderForm({ monters }: { monters: Monter[] }) {
  const [msg, setMsg] = useState<string | null>(null)
  const [assignedTo, setAssignedTo] = useState<string>("")
  const [pending, start] = useTransition()

  return (
    <form
      action={(fd) =>
        start(async () => {
          setMsg(null)
          fd.set("assignedToId", assignedTo)
          const res = await createOrderAction(fd)
          setMsg(res.error ?? (res.ok ? "Zlecenie dodane." : null))
        })
      }
      className="max-w-xl space-y-4 rounded-lg border p-4"
    >
      <h2 className="text-lg font-medium">Dodaj zlecenie</h2>

      <div className="grid gap-2">
        <Label htmlFor="order-customer" className="text-sm">
          Klient
        </Label>
        <Input
          id="order-customer"
          name="customerName"
          required
          placeholder="Jan Kowalski"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="order-city" className="text-sm">
          Miasto
        </Label>
        <Input
          id="order-city"
          name="city"
          required
          placeholder="Warszawa"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="order-phone" className="text-sm">
          Telefon
        </Label>
        <Input
          id="order-phone"
          name="phone"
          required
          placeholder="600 000 000"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="order-address" className="text-sm">
          Adres
        </Label>
        <Input id="order-address" name="address" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="order-area" className="text-sm">
          Wstępny metraż (m²)
        </Label>
        <Input
          id="order-area"
          name="initialArea"
          type="number"
          min="0"
          step="0.01"
          required
          placeholder="45"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="order-panel" className="text-sm">
          Wybrany panel
        </Label>
        <Input
          id="order-panel"
          name="selectedPanel"
          placeholder="Panel Dąb Naturalny"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="order-notes" className="text-sm">
          Notatka dla montera
        </Label>
        <Textarea
          id="order-notes"
          name="notes"
          rows={3}
          placeholder="Dodatkowe informacje od klienta"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="order-date" className="text-sm">
          Planowana data
        </Label>
        <Input id="order-date" name="plannedDate" type="date" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="order-assigned" className="text-sm">
          Przypisz montera
        </Label>
        <Select value={assignedTo} onValueChange={setAssignedTo}>
          <SelectTrigger id="order-assigned">
            <SelectValue placeholder="— brak —" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">— brak —</SelectItem>
            {monters.map((m) => (
              <SelectItem key={m.id} value={String(m.id)}>
                {m.firstName ?? m.email} ({m.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="assignedToId" value={assignedTo} />
      </div>

      <Button disabled={pending} className="font-medium">
        {pending ? "Dodaję..." : "Dodaj zlecenie"}
      </Button>

      {msg && <p className="text-sm text-destructive">{msg}</p>}
    </form>
  )
}
