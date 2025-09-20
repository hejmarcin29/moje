import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import OrderRowActions from "./OrderRowActions";

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
      plannedDate: true,
      status: true,
      notes: true,
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
              <th className="px-3 py-2 text-left">Status / Notatka</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t align-top">
                <td className="px-3 py-2">{o.id}</td>
                <td className="px-3 py-2">
                  <div className="font-medium">{o.title}</div>
                </td>
                <td className="px-3 py-2">
                  <div>{o.customerName ?? "—"}</div>
                  <div className="text-xs text-neutral-500">{o.address ?? "—"}</div>
                </td>
                <td className="px-3 py-2">{toDate(o.plannedDate)}</td>

                <OrderRowActions id={o.id} status={o.status} notes={o.notes} />
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-neutral-500">
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
