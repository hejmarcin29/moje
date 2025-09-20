import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import AddOrderForm from "./AddOrderForm";
import OrderRowActions from "./OrderRowActions";

export const metadata = { title: "Zlecenia — Admin" };

export default async function OrdersPage() {
  const s = await getSession();
  if (!s || s.user.role !== Role.ADMIN) redirect("/");

  const [orders, monters] = await Promise.all([
    prisma.order.findMany({
      orderBy: { id: "desc" },
      select: {
        id: true, title: true, customerName: true, address: true,
        plannedDate: true, status: true, assignedToId: true,
        assignedTo: { select: { id: true, firstName: true, email: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: "MONTAZYSTA", isActive: true },
      select: { id: true, firstName: true, email: true },
      orderBy: [{ firstName: "asc" }, { email: "asc" }],
    }),
  ]);

  const toDateInput = (d: Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : null);

  return (
    <main className="p-8 space-y-8">
      <h1 className="text-2xl font-semibold">Zlecenia</h1>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Tytuł</th>
              <th className="px-3 py-2 text-left">Klient / Adres</th>
              <th className="px-3 py-2 text-left">Monter</th>
              <th className="px-3 py-2 text-left">Edycja</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t align-top">
                <td className="px-3 py-2">{o.id}</td>
                <td className="px-3 py-2">
                  <div className="font-medium">{o.title}</div>
                  <div className="text-xs text-neutral-500">
                    {o.status} · plan: {toDateInput(o.plannedDate) ?? "—"}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div>{o.customerName ?? "—"}</div>
                  <div className="text-xs text-neutral-500">{o.address ?? "—"}</div>
                </td>
                <td className="px-3 py-2">
                  {o.assignedTo ? (o.assignedTo.firstName ?? o.assignedTo.email) : "—"}
                </td>
                <OrderRowActions
                  id={o.id}
                  status={o.status}
                  plannedDate={toDateInput(o.plannedDate)}
                  assignedToId={o.assignedToId}
                  monters={monters}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddOrderForm monters={monters} />
    </main>
  );
}
