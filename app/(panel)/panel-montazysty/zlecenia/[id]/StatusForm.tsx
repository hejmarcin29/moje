"use client"

import { useState, useTransition } from "react"
import type { OrderStatus } from "@prisma/client"
import { updateMyOrderAction } from "../actions"
import { Button } from "@/components/ui/button"
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
  status: OrderStatus;
  notes: string | null;
};

export default function StatusForm({ orderId, status, notes }: Props) {
  const [message, setMessage] = useState<string | null>(null)
  const [statusValue, setStatusValue] = useState<OrderStatus>(status)
  const [pending, startTransition] = useTransition()

  return (
    <form
      className="space-y-3 rounded-lg border p-4"
      action={(fd) =>
        startTransition(async () => {
          setMessage(null)
          fd.set("id", String(orderId))
          fd.set("status", statusValue)
          const res = await updateMyOrderAction(fd)
          setMessage(res.error ?? (res.ok ? "Zapisano status." : null))
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
        <Label htmlFor="order-status" className="text-sm">
          Status
        </Label>
        <Select value={statusValue} onValueChange={(value) => setStatusValue(value as OrderStatus)}>
          <SelectTrigger id="order-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NOWE">NOWE</SelectItem>
            <SelectItem value="W_TRAKCIE">W TRAKCIE</SelectItem>
            <SelectItem value="ZAKONCZONE">ZAKOŃCZONE</SelectItem>
            <SelectItem value="ANULOWANE">ANULOWANE</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" name="status" value={statusValue} />
      </div>

      <div className="grid gap-1">
        <Label htmlFor="order-note" className="text-sm">
          Notatka
        </Label>
        <Textarea
          id="order-note"
          name="notes"
          rows={3}
          defaultValue={notes ?? ""}
          placeholder="Wpisz dodatkowe informacje..."
        />
      </div>

      <Button disabled={pending} className="font-medium">
        {pending ? "Zapisuję..." : "Zapisz"}
      </Button>

      {message && <p className="text-sm text-destructive">{message}</p>}
    </form>
  )
}
