import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { formatArea } from "@/lib/orderTitle";
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
        id: true,
        title: true,
        customerName: true,
        address: true,
        city: true,
        phone: true,
        initialArea: true,
        measuredArea: true,
        selectedPanel: true,
        plannedDate: true,
        status: true,
        notes: true,
        assignedToId: true,
        assignedTo: { select: { id: true, firstName: true, email: true } },
        measurement: {
          select: {
            trimMode: true,
            panelName: true,
            measuredArea: true,
            wastePercentage: true,
            installationDate: true,
            deliveryDate: true,
            deliveryOffsetDays: true,
            carryNote: true,
            installationAddress: true,
            updatedAt: true,
          },
        },
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
              <th className="px-3 py-2 text-left">Klient / Kontakt</th>
              <th className="px-3 py-2 text-left">Panele &amp; pomiar</th>
              <th className="px-3 py-2 text-left">Monter</th>
              <th className="px-3 py-2 text-left">Edycja</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const diff =
                o.measuredArea !== null && o.initialArea !== null
                  ? o.measuredArea - o.initialArea
                  : null;

              return (
                <tr key={o.id} className="border-t align-top">
                  <td className="px-3 py-2">{o.id}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{o.title}</div>
                    <div className="text-xs text-neutral-500">
                      {o.status} · plan: {toDateInput(o.plannedDate) ?? "—"}
                    </div>
                  </td>
                  <td className="px-3 py-2 space-y-1">
                    <div className="font-medium">{o.customerName ?? "—"}</div>
                    <div className="text-xs text-neutral-500">{o.city ?? "—"}</div>
                    <div className="text-xs text-neutral-500">tel. {o.phone ?? "—"}</div>
                    <div className="text-xs text-neutral-500">{o.address ?? "—"}</div>
                    {o.notes && (
                      <div className="text-xs text-neutral-500">Notatka: {o.notes}</div>
                    )}
                  </td>
                  <td className="px-3 py-2 space-y-1">
                    <div>{o.selectedPanel ?? "—"}</div>
                    <div className="text-xs text-neutral-500">
                      Wstępnie: {formatArea(o.initialArea) ?? "—"} m²
                    </div>
                    <div className="text-xs text-neutral-500">
                      Pomiar: {formatArea(o.measuredArea) ?? "—"} m²
                    </div>
                    {diff !== null && (
                      <div className="text-xs text-neutral-500">
                        Różnica: {(diff > 0 ? "+" : "") + diff.toFixed(2)} m²
                      </div>
                    )}
                    {o.measurement && (
                      <div className="space-y-1 text-xs text-neutral-500">
                        <div>Listwy: {o.measurement.trimMode === "SEPARATE" ? "osobno" : "razem"}</div>
                        <div>Adres montażu: {o.measurement.installationAddress}</div>
                        <div>
                          Termin montażu: {toDateInput(o.measurement.installationDate) ?? "—"}
                        </div>
                        <div>
                          Dostawa paneli:
                          {o.measurement.deliveryDate
                            ? ` ${toDateInput(o.measurement.deliveryDate)}`
                            : o.measurement.deliveryOffsetDays != null
                            ? ` ${o.measurement.deliveryOffsetDays} dni przed`
                            : " —"}
                        </div>
                        <div>Zapas: {o.measurement.wastePercentage}%</div>
                        {o.measurement.carryNote && <div>Wnoszenie: {o.measurement.carryNote}</div>}
                      </div>
                    )}
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
                    customerName={o.customerName ?? ""}
                    city={o.city ?? ""}
                    phone={o.phone ?? ""}
                    address={o.address ?? ""}
                    initialArea={o.initialArea ?? undefined}
                    selectedPanel={o.selectedPanel ?? ""}
                    notes={o.notes ?? ""}
                  />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AddOrderForm monters={monters} />
    </main>
  );
}
