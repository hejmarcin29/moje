import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Role } from "@prisma/client"
import AddUserForm from "./AddUserForm"
import UserRowActions from "./UserRowActions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const metadata = { title: "Użytkownicy — Admin" };

export default async function UsersPage() {
  const s = await getSession()
  if (!s || s.user.role !== Role.ADMIN) redirect("/")

  const users = await prisma.user.findMany({
    orderBy: { id: "desc" },
    select: { id: true, email: true, firstName: true, role: true, isActive: true },
  })

  return (
    <main className="space-y-8 p-8">
      <h1 className="text-2xl font-semibold">Użytkownicy</h1>

      <div className="rounded-lg border">
        <Table className="text-sm">
          <TableHeader className="bg-neutral-50">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Edycja</TableHead>
              <TableHead>Rola</TableHead>
              <TableHead>Aktywny</TableHead>
              <TableHead>Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} className="align-top">
                <TableCell>{u.id}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.firstName ?? "—"}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>{u.isActive ? "tak" : "nie"}</TableCell>
                <UserRowActions id={u.id} firstName={u.firstName} role={u.role} isActive={u.isActive} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AddUserForm />
    </main>
  )
}
