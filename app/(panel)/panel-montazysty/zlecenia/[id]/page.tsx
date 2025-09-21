import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Role } from "@prisma/client";
import StatusForm from "./StatusForm";
import MeasurementForm from "./MeasurementForm";
import { formatArea } from "@/lib/orderTitle";

export const metadata = { title: "Szczegóły zlecenia — Monter" };

type Params = { params: { id: string } };

function toDate(value: Date | string | null): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toISOString().slice(0, 10);
}

export default async function OrderDetailsPage({ params }: Params) {
  const orderId = Number(params.id);
  if (!orderId) notFound();

  const session = await getSession();
  if (!session || session.user.role !== Role.MONTAZYSTA) redirect("/");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      title: true,
      status: true,
      notes: true,
      customerName: true,
      address: true,
      city: true,
      phone: true,
      plannedDate: true,
      initialArea: true,
      measuredArea: true,
      selectedPanel: true,
      assignedToId: true,
      measurement: {
        select: {
          trimMode: true,
          installationAddress: true,
          panelName: true,
          measuredArea: true,
          wastePercentage: true,
          installationDate: true,
          deliveryDate: true,
          deliveryOffsetDays: true,
          carryNote: true,
        },
      },
    },
  });

  if (!order || order.assignedToId !== session.user.id) notFound();

  const plannedDate = toDate(order.plannedDate);
  const initialAreaDisplay = formatArea(order.initialArea) ? `${formatArea(order.initialArea)} m²` : "—";
  const measuredAreaDisplay = formatArea(order.measuredArea) ? `${formatArea(order.measuredArea)} m²` : "—";
  const diffValue =
    order.measuredArea != null && order.initialArea != null
      ? order.measuredArea - order.initialArea
      : null;
  const diffDisplay = diffValue != null ? `${diffValue > 0 ? "+" : ""}${diffValue.toFixed(2)} m²` : "—";

  const measurementData = order.measurement
    ? {
        trimMode: order.measurement.trimMode,
        installationAddress: order.measurement.installationAddress,
        panelName: order.measurement.panelName,
        measuredArea: order.measurement.measuredArea.toString(),
        wastePercentage: order.measurement.wastePercentage,
        installationDate: order.measurement.installationDate
          ? toDate(order.measurement.installationDate)
          : null,
        deliveryDate: order.measurement.deliveryDate ? toDate(order.measurement.deliveryDate) : null,
        deliveryOffsetDays: order.measurement.deliveryOffsetDays,
        carryNote: order.measurement.carryNote,
      }
    : null;

  return (
    <main className="space-y-8 p-6 md:p-8">
      <Link
        href="/panel-montazysty/zlecenia"
        className="inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900"
      >
        ← Powrót do listy
      </Link>

      <section className="rounded-lg border p-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{order.title}</h1>
          <p className="text-sm text-neutral-500">Planowany montaż: {plannedDate}</p>
        </div>

        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="font-medium text-neutral-600">Klient</dt>
            <dd>{order.customerName ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-neutral-600">Telefon</dt>
            <dd>{order.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-neutral-600">Miasto</dt>
            <dd>{order.city ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-neutral-600">Adres</dt>
            <dd>{order.address ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-neutral-600">Wybrany panel</dt>
            <dd>{order.selectedPanel ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-neutral-600">Status</dt>
            <dd>{order.status}</dd>
          </div>
          <div>
            <dt className="font-medium text-neutral-600">Metraż wstępny</dt>
            <dd>{initialAreaDisplay}</dd>
          </div>
          <div>
            <dt className="font-medium text-neutral-600">Metraż z pomiaru</dt>
            <dd>{measuredAreaDisplay}</dd>
          </div>
          <div>
            <dt className="font-medium text-neutral-600">Różnica</dt>
            <dd>{diffDisplay}</dd>
          </div>
          {order.notes && (
            <div className="md:col-span-2">
              <dt className="font-medium text-neutral-600">Notatka</dt>
              <dd>{order.notes}</dd>
            </div>
          )}
        </dl>
      </section>

      <StatusForm orderId={order.id} status={order.status} notes={order.notes ?? null} />

      <MeasurementForm
        orderId={order.id}
        orderAddress={order.address}
        selectedPanel={order.selectedPanel}
        initialArea={initialAreaDisplay}
        measuredArea={measuredAreaDisplay}
        measurement={measurementData}
      />
    </main>
  );
}
