"use client"

import { useState, useTransition } from "react"
import { assignOrderAction, updateOrderAction, deleteOrderAction } from "./actions"
import type { OrderStatus } from "@prisma/client"
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
  const [msg, setMsg] = useState<string | null>(null)
  const [detailsMsg, setDetailsMsg] = useState<string | null>(null)
  const [status, setStatus] = useState<OrderStatus>(props.status)
  const [assigned, setAssigned] = useState<string>(props.assignedToId ? String(props.assignedToId) : "")
  const [pending, start] = useTransition()

  return (
    <td className="space-y-4 px-3 py-2">
      {/* Status + data */}
      <form
        className="flex flex-wrap items-center gap-2"
        action={(fd) =>
          start(async () => {
            setMsg(null)
            fd.set("id", String(props.id))
            fd.set("status", status)
            const res = await updateOrderAction(fd)
            setMsg(res.error ?? (res.ok ? "Zapisano." : null))
          })
        }
      >
        <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
          <SelectTrigger className="h-9 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NOWE">NOWE</SelectItem>
            <SelectItem value="W_TRAKCIE">W TRAKCIE</SelectItem>
            <SelectItem value="ZAKONCZONE">ZAKOŃCZONE</SelectItem>
            <SelectItem value="ANULOWANE">ANULOWANE</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" name="status" value={status} />
        <Input
          name="plannedDate"
          type="date"
          defaultValue={props.plannedDate ?? undefined}
          className="h-9 w-40"
        />
        <Button variant="outline" size="sm" disabled={pending}>
          Zapisz
        </Button>
      </form>

      {/* Przypisz montera */}
      <form
        className="flex flex-wrap items-center gap-2"
        action={(fd) =>
          start(async () => {
            setMsg(null)
            fd.set("id", String(props.id))
            fd.set("assignedToId", assigned)
            const res = await assignOrderAction(fd)
            setMsg(res.error ?? (res.ok ? "Zapisano." : null))
          })
        }
      >
        <Select value={assigned} onValueChange={setAssigned}>
          <SelectTrigger className="h-9 w-48">
            <SelectValue placeholder="— brak —" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">— brak —</SelectItem>
            {props.monters.map((m) => (
              <SelectItem key={m.id} value={String(m.id)}>
                {m.firstName ?? m.email} ({m.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="assignedToId" value={assigned} />
        <Button variant="outline" size="sm" disabled={pending}>
          Przypisz
        </Button>
      </form>

      {/* Szczegóły */}
      <form
        className="grid gap-2"
        action={(fd) =>
          start(async () => {
            setDetailsMsg(null)
            fd.set("id", String(props.id))
            const res = await updateOrderAction(fd)
            setDetailsMsg(res.error ?? (res.ok ? "Zapisano." : null))
          })
        }
      >
        <div className="grid gap-1">
          <Label
            htmlFor={`order-customer-${props.id}`}
            className="text-xs uppercase tracking-wide text-neutral-500"
          >
            Klient
          </Label>
          <Input
            id={`order-customer-${props.id}`}
            name="customerName"
            defaultValue={props.customerName}
            className="h-9"
          />
        </div>
        <div className="grid gap-1">
          <Label
            htmlFor={`order-city-${props.id}`}
            className="text-xs uppercase tracking-wide text-neutral-500"
          >
            Miasto
          </Label>
          <Input id={`order-city-${props.id}`} name="city" defaultValue={props.city} className="h-9" />
        </div>
        <div className="grid gap-1">
          <Label
            htmlFor={`order-phone-${props.id}`}
            className="text-xs uppercase tracking-wide text-neutral-500"
          >
            Telefon
          </Label>
          <Input id={`order-phone-${props.id}`} name="phone" defaultValue={props.phone} className="h-9" />
        </div>
        <div className="grid gap-1">
          <Label
            htmlFor={`order-address-${props.id}`}
            className="text-xs uppercase tracking-wide text-neutral-500"
          >
            Adres
          </Label>
          <Input id={`order-address-${props.id}`} name="address" defaultValue={props.address} className="h-9" />
        </div>
        <div className="grid gap-1">
          <Label
            htmlFor={`order-area-${props.id}`}
            className="text-xs uppercase tracking-wide text-neutral-500"
          >
            Wstępny metraż (m²)
          </Label>
          <Input
            id={`order-area-${props.id}`}
            name="initialArea"
            type="number"
            step="0.01"
            min="0"
            defaultValue={props.initialArea ?? ""}
            className="h-9"
          />
        </div>
        <div className="grid gap-1">
          <Label
            htmlFor={`order-panel-${props.id}`}
            className="text-xs uppercase tracking-wide text-neutral-500"
          >
            Panel
          </Label>
          <Input
            id={`order-panel-${props.id}`}
            name="selectedPanel"
            defaultValue={props.selectedPanel}
            className="h-9"
          />
        </div>
        <div className="grid gap-1">
          <Label
            htmlFor={`order-notes-${props.id}`}
            className="text-xs uppercase tracking-wide text-neutral-500"
          >
            Notatka
          </Label>
          <Textarea
            id={`order-notes-${props.id}`}
            name="notes"
            rows={2}
            defaultValue={props.notes}
          />
        </div>
        <Button variant="outline" size="sm" disabled={pending}>
          Zapisz dane
        </Button>
      </form>

      {/* Usuń */}
      <form
        action={() =>
          start(async () => {
            setMsg(null)
            const fd = new FormData()
            fd.set("id", String(props.id))
            const res = await deleteOrderAction(fd)
            setMsg(res.error ?? (res.ok ? "Usunięto." : null))
          })
        }
      >
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          className="text-destructive hover:bg-destructive/10"
        >
          Usuń
        </Button>
      </form>

      {msg && <p className="text-xs text-destructive">{msg}</p>}
      {detailsMsg && <p className="text-xs text-destructive">{detailsMsg}</p>}
    </td>
  )
}
