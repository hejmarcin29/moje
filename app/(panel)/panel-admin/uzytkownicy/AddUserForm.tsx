"use client"

import { useState, useTransition } from "react"
import { createUserAction } from "./actions"
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

export default function AddUserForm() {
  const [msg, setMsg] = useState<string | null>(null)
  const [role, setRole] = useState("MONTAZYSTA")
  const [pending, startTransition] = useTransition()

  return (
    <form
      action={async (fd) => {
        setMsg(null)
        startTransition(async () => {
          fd.set("role", role)
          const res = await createUserAction(fd)
          setMsg(res.error ?? (res.ok ? "Użytkownik dodany." : null))
        })
      }}
      className="max-w-md space-y-4 rounded-lg border p-4"
    >
      <h2 className="text-lg font-medium">Dodaj użytkownika</h2>

      <div className="grid gap-2">
        <Label htmlFor="user-email" className="text-sm">
          E-mail
        </Label>
        <Input
          id="user-email"
          name="email"
          type="email"
          required
          placeholder="user@primepodloga.pl"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="user-first-name" className="text-sm">
          Imię (opcjonalnie)
        </Label>
        <Input id="user-first-name" name="firstName" type="text" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="user-role" className="text-sm">
          Rola
        </Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger id="user-role">
            <SelectValue placeholder="Wybierz rolę" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MONTAZYSTA">MONTAŻYSTA</SelectItem>
            <SelectItem value="ADMIN">ADMIN</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" name="role" value={role} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="user-password" className="text-sm">
          Hasło
        </Label>
        <Input id="user-password" name="password" type="password" required minLength={8} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="user-password2" className="text-sm">
          Powtórz hasło
        </Label>
        <Input id="user-password2" name="password2" type="password" required minLength={8} />
      </div>

      <Button type="submit" disabled={pending} className="font-medium">
        {pending ? "Dodaję..." : "Dodaj"}
      </Button>

      {msg && <p className="text-sm text-destructive">{msg}</p>}
    </form>
  )
}
