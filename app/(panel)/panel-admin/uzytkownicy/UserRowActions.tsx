"use client"

import { useState, useTransition } from "react"
import { updateUserAction, toggleActiveAction, resetPasswordAction } from "./actions"
import type { Role } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function UserRowActions(props: {
  id: number;
  firstName: string | null;
  role: Role;
  isActive: boolean;
}) {
  const [msg, setMsg] = useState<string | null>(null)
  const [role, setRole] = useState<Role>(props.role)
  const [pending, start] = useTransition()

  return (
    <td className="space-y-2 px-3 py-2">
      {/* Edycja imienia + roli */}
      <form
        className="flex items-center gap-2"
        action={(fd) =>
          start(async () => {
            setMsg(null)
            fd.set("id", String(props.id))
            fd.set("role", role)
            const res = await updateUserAction(fd)
            setMsg(res.error ?? (res.ok ? "Zapisano." : null))
          })
        }
      >
        <input type="hidden" name="id" value={props.id} />
        <div className="grid gap-1">
          <Label className="sr-only" htmlFor={`user-first-name-${props.id}`}>
            Imię
          </Label>
          <Input
            id={`user-first-name-${props.id}`}
            name="firstName"
            defaultValue={props.firstName ?? ""}
            placeholder="Imię"
            className="h-9 w-32"
          />
        </div>
        <div className="grid gap-1">
          <Label className="sr-only" htmlFor={`user-role-${props.id}`}>
            Rola
          </Label>
          <Select value={role} onValueChange={(value) => setRole(value as Role)}>
            <SelectTrigger id={`user-role-${props.id}`} className="h-9 w-40">
              <SelectValue placeholder="Rola" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MONTAZYSTA">MONTAŻYSTA</SelectItem>
              <SelectItem value="ADMIN">ADMIN</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="role" value={role} />
        </div>
        <Button variant="outline" size="sm" disabled={pending}>
          Zapisz
        </Button>
      </form>

      {/* Aktywacja/dezaktywacja */}
      <form
        action={() =>
          start(async () => {
            setMsg(null)
            const fd = new FormData()
            fd.set("id", String(props.id))
            fd.set("active", String(props.isActive))
            const res = await toggleActiveAction(fd)
            setMsg(res.error ?? (res.ok ? (props.isActive ? "Dezaktywowano." : "Aktywowano.") : null))
          })
        }
      >
        <Button variant="outline" size="sm" disabled={pending}>
          {props.isActive ? "Dezaktywuj" : "Aktywuj"}
        </Button>
      </form>

      {/* Reset hasła */}
      <form
        className="flex gap-2"
        action={(fd) =>
          start(async () => {
            setMsg(null)
            fd.set("id", String(props.id))
            const res = await resetPasswordAction(fd)
            setMsg(res.error ?? (res.ok ? "Hasło ustawione." : null))
          })
        }
      >
        <div className="grid gap-1">
          <Label className="sr-only" htmlFor={`reset-password-${props.id}`}>
            Nowe hasło
          </Label>
          <Input
            id={`reset-password-${props.id}`}
            name="password"
            type="password"
            placeholder="Nowe hasło"
            minLength={8}
            className="h-9"
          />
        </div>
        <div className="grid gap-1">
          <Label className="sr-only" htmlFor={`reset-password2-${props.id}`}>
            Powtórz hasło
          </Label>
          <Input
            id={`reset-password2-${props.id}`}
            name="password2"
            type="password"
            placeholder="Powtórz"
            minLength={8}
            className="h-9"
          />
        </div>
        <Button variant="outline" size="sm" disabled={pending}>
          Reset
        </Button>
      </form>

      {msg && <p className="text-xs text-destructive">{msg}</p>}
    </td>
  )
}
