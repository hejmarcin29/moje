import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Role } from "@prisma/client"
import Link from "next/link"
import { formatArea } from "@/lib/orderTitle"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const metadata = { title: "Moje zlecenia — Monter" };

export default async function MyOrdersPage() {
  const s = await getSession()
  if (!s || s.user.role !== Role.MONTAZYSTA) redirect("/")

  const orders = await prisma.order.findMany({
    where: { assignedToId: s.user.id },
    orderBy: { plannedDate: "asc" },
    select: {
      id: true,
      title: true,
      customerName: true,
      address: true,
      city: true,
      phone: true,
      plannedDate: true,
      status: true,
      notes: true,
      initialArea: true,
      measuredArea: true,
      selectedPanel: true,
    },
  })

  const toDate = (d: Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : "—")

  return (
    <main className="space-y-8 p-8">
      <h1 className="text-2xl font-semibold">Moje zlecenia</h1>

      <div className="rounded-lg border">
        <Table className="text-sm">
          <TableHeader className="bg-neutral-50">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tytuł</TableHead>
              <TableHead>Klient / Adres</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Panele</TableHead>
              <TableHead>Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id} className="align-top">
                <TableCell>{o.id}</TableCell>
                <TableCell>
                  <div className="font-medium">{o.title}</div>
                  <div className="text-xs text-neutral-500">Status: {o.status}</div>
                </TableCell>
                <TableCell>
                  <div>{o.customerName ?? "—"}</div>
                  <div className="text-xs text-neutral-500">{o.address ?? "—"}</div>
                  <div className="text-xs text-neutral-500">{o.city ?? "—"}</div>
                  <div className="text-xs text-neutral-500">tel. {o.phone ?? "—"}</div>
                  {o.notes && (
                    <div className="text-xs text-neutral-500">Notatka: {o.notes}</div>
                  )}
                </TableCell>
                <TableCell>{toDate(o.plannedDate)}</TableCell>
                <TableCell className="text-xs text-neutral-500">
                  <div className="text-sm text-neutral-700">{o.selectedPanel ?? "—"}</div>
                  <div>Wstępnie: {formatArea(o.initialArea) ?? "—"} m²</div>
                  <div>Pomiar: {formatArea(o.measuredArea) ?? "—"} m²</div>
                </TableCell>
                <TableCell>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/panel-montazysty/zlecenia/${o.id}`}>Szczegóły</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="px-3 py-6 text-center text-neutral-500">
                  Brak przypisanych zleceń.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  )
}
