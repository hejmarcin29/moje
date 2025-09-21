import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import Link from "next/link";
import { formatArea } from "@/lib/orderTitle";

export const metadata = { title: "Moje zlecenia — Monter" };

export default async function MyOrdersPage() {
  const s = await getSession();
  if (!s || s.user.role !== Role.MONTAZYSTA) redirect("/");

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
  });

  const toDate = (d: Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : "—");

  return (
    <main className="p-8 space-y-8">
      <h1 className="text-2xl font-semibold">Moje zlecenia</h1>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Tytuł</th>
              <th className="px-3 py-2 text-left">Klient / Adres</th>
              <th className="px-3 py-2 text-left">Plan</th>
              <th className="px-3 py-2 text-left">Panele</th>
              <th className="px-3 py-2 text-left">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t align-top">
                <td className="px-3 py-2">{o.id}</td>
                <td className="px-3 py-2">
                  <div className="font-medium">{o.title}</div>
                  <div className="text-xs text-neutral-500">Status: {o.status}</div>
                </td>
                <td className="px-3 py-2">
                  <div>{o.customerName ?? "—"}</div>
                  <div className="text-xs text-neutral-500">{o.address ?? "—"}</div>
                  <div className="text-xs text-neutral-500">{o.city ?? "—"}</div>
                  <div className="text-xs text-neutral-500">tel. {o.phone ?? "—"}</div>
                  {o.notes && (
                    <div className="text-xs text-neutral-500">Notatka: {o.notes}</div>
                  )}
                </td>
                <td className="px-3 py-2">{toDate(o.plannedDate)}</td>
                <td className="px-3 py-2 text-xs text-neutral-500">
                  <div className="text-sm text-neutral-700">{o.selectedPanel ?? "—"}</div>
                  <div>Wstępnie: {formatArea(o.initialArea) ?? "—"} m²</div>
                  <div>Pomiar: {formatArea(o.measuredArea) ?? "—"} m²</div>
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/panel-montazysty/zlecenia/${o.id}`}
                    className="inline-flex items-center rounded-md border px-3 py-1 text-sm font-medium hover:bg-neutral-50"
                  >
                    Szczegóły
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-neutral-500">
                  Brak przypisanych zleceń.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
