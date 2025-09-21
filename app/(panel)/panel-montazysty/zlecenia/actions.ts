"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Role, OrderStatus, TrimMode } from "@prisma/client";
import { buildOrderTitle } from "@/lib/orderTitle";

type ActionResult = { ok?: true; error?: string };

async function assertMonter() {
  const s = await getSession();
  if (!s || s.user.role !== Role.MONTAZYSTA) return null;
  return s;
}

export async function updateMyOrderAction(fd: FormData): Promise<ActionResult> {
  const s = await assertMonter();
  if (!s) return { error: "Brak uprawnień." };

  const id = Number(fd.get("id"));
  const status = String(fd.get("status") ?? "") as OrderStatus;
  const notes = String(fd.get("notes") ?? "").trim() || null;

  if (!id) return { error: "Brak ID." };
  if (!Object.values(OrderStatus).includes(status)) return { error: "Zły status." };

  // sprawdź własność zlecenia
  const order = await prisma.order.findUnique({ where: { id }, select: { assignedToId: true } });
  if (!order || order.assignedToId !== s.user.id) return { error: "To nie jest Twoje zlecenie." };

  await prisma.order.update({
    where: { id },
    data: { status, notes },
  });

  revalidatePath("/panel-montazysty/zlecenia");
  revalidatePath(`/panel-montazysty/zlecenia/${id}`);
  revalidatePath("/panel-admin/zlecenia");
  return { ok: true };
}

export async function saveMeasurementAction(fd: FormData): Promise<ActionResult> {
  const s = await assertMonter();
  if (!s) return { error: "Brak uprawnień." };

  const orderId = Number(fd.get("orderId"));
  if (!orderId) return { error: "Brak ID zlecenia." };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { assignedToId: true, city: true, customerName: true, initialArea: true, selectedPanel: true },
  });

  if (!order || order.assignedToId !== s.user.id) return { error: "To nie jest Twoje zlecenie." };

  const installationAddress = String(fd.get("installationAddress") ?? "").trim();
  if (!installationAddress) return { error: "Podaj adres montażu." };

  const trimModeRaw = String(fd.get("trimMode") ?? "");
  const trimMode = trimModeRaw as TrimMode;
  if (!Object.values(TrimMode).includes(trimMode)) return { error: "Wybierz sposób montażu listew." };

  const panelName = String(fd.get("panelName") ?? "").trim() || order.selectedPanel || "";
  if (!panelName) return { error: "Podaj nazwę paneli." };

  const measuredAreaRaw = String(fd.get("measuredArea") ?? "").trim();
  if (!measuredAreaRaw) return { error: "Podaj wynik pomiaru." };
  const measuredArea = Number(measuredAreaRaw.replace(",", "."));
  if (!Number.isFinite(measuredArea) || measuredArea <= 0) return { error: "Niepoprawny wynik pomiaru." };

  const wastePercentageRaw = String(fd.get("wastePercentage") ?? "").trim();
  const wastePercentage = Number(wastePercentageRaw);
  if (!Number.isInteger(wastePercentage) || wastePercentage < 5 || wastePercentage > 20)
    return { error: "Zapas powinien mieścić się w przedziale 5–20%." };

  const installationDateRaw = String(fd.get("installationDate") ?? "").trim();
  const installationDate = installationDateRaw ? new Date(installationDateRaw) : null;
  if (installationDateRaw && (!installationDate || isNaN(installationDate.getTime())))
    return { error: "Niepoprawny termin montażu." };

  const deliveryDateRaw = String(fd.get("deliveryDate") ?? "").trim();
  const deliveryDate = deliveryDateRaw ? new Date(deliveryDateRaw) : null;
  if (deliveryDateRaw && (!deliveryDate || isNaN(deliveryDate.getTime())))
    return { error: "Niepoprawny termin dostawy." };

  const deliveryOffsetRaw = String(fd.get("deliveryOffsetDays") ?? "").trim();
  let deliveryOffsetDays: number | null = null;
  if (deliveryOffsetRaw) {
    deliveryOffsetDays = Number(deliveryOffsetRaw);
    if (!Number.isInteger(deliveryOffsetDays) || deliveryOffsetDays < 0)
      return { error: "Podaj liczbę dni jako nieujemną liczbę całkowitą." };
  }

  const carryNote = String(fd.get("carryNote") ?? "").trim() || null;

  await prisma.measurement.upsert({
    where: { orderId },
    create: {
      orderId,
      installationAddress,
      trimMode,
      panelName,
      measuredArea,
      wastePercentage,
      installationDate,
      deliveryDate,
      deliveryOffsetDays,
      carryNote,
    },
    update: {
      installationAddress,
      trimMode,
      panelName,
      measuredArea,
      wastePercentage,
      installationDate,
      deliveryDate,
      deliveryOffsetDays,
      carryNote,
    },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: {
      address: installationAddress,
      selectedPanel: panelName,
      measuredArea,
      title: buildOrderTitle({
        city: order.city,
        customerName: order.customerName ?? undefined,
        measuredArea,
        fallbackArea: order.initialArea ?? undefined,
      }),
    },
  });

  revalidatePath(`/panel-montazysty/zlecenia/${orderId}`);
  revalidatePath("/panel-montazysty/zlecenia");
  revalidatePath("/panel-admin/zlecenia");
  return { ok: true };
}
