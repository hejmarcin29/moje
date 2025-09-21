"use server";

import { revalidatePath } from "next/cache";
import { Role, OrderStatus, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { buildOrderTitle } from "@/lib/orderTitle";

export type ActionResult = { ok?: true; error?: string };

async function assertAdmin(): Promise<boolean> {
  const s = await getSession();
  return !!(s && s.user.role === Role.ADMIN);
}

export async function createOrderAction(fd: FormData): Promise<ActionResult> {
  if (!(await assertAdmin())) return { error: "Brak uprawnień." };

  const customerNameRaw = String(fd.get("customerName") ?? "").trim();
  const cityRaw = String(fd.get("city") ?? "").trim();
  const phoneRaw = String(fd.get("phone") ?? "").trim();
  const address = String(fd.get("address") ?? "").trim() || null;
  const plannedDateRaw = String(fd.get("plannedDate") ?? "") || null;
  const assignedToIdRaw = String(fd.get("assignedToId") ?? "") || "";
  const initialAreaRaw = String(fd.get("initialArea") ?? "").trim();
  const selectedPanel = String(fd.get("selectedPanel") ?? "").trim() || null;
  const notes = String(fd.get("notes") ?? "").trim() || null;

  if (!customerNameRaw) return { error: "Podaj imię i nazwisko klienta." };
  if (!cityRaw) return { error: "Podaj miasto." };
  if (!phoneRaw) return { error: "Podaj numer telefonu." };
  if (!initialAreaRaw) return { error: "Podaj wstępny metraż." };

  const plannedDate = plannedDateRaw ? new Date(plannedDateRaw) : null;
  const assignedToId = assignedToIdRaw ? Number(assignedToIdRaw) : null;
  if (assignedToId && isNaN(assignedToId)) return { error: "Niepoprawny monter." };

  const initialArea = Number(initialAreaRaw.replace(",", "."));
  if (!Number.isFinite(initialArea) || initialArea <= 0)
    return { error: "Niepoprawny metraż." };

  const title = buildOrderTitle({
    city: cityRaw,
    customerName: customerNameRaw,
    fallbackArea: initialArea,
  });

  const created = await prisma.order.create({
    data: {
      title,
      customerName: customerNameRaw,
      address,
      city: cityRaw,
      phone: phoneRaw,
      initialArea,
      selectedPanel,
      notes,
      plannedDate,
      assignedToId: assignedToId ?? null,
    },
    select: { id: true, assignedToId: true },
  });

  revalidatePath("/panel-admin/zlecenia");
  revalidatePath("/panel-montazysty/zlecenia");
  if (created.assignedToId) {
    revalidatePath(`/panel-montazysty/zlecenia/${created.id}`);
  }
  return { ok: true };
}

export async function updateOrderAction(fd: FormData): Promise<ActionResult> {
  if (!(await assertAdmin())) return { error: "Brak uprawnień." };
  const id = Number(fd.get("id"));
  if (!id) return { error: "Brak ID." };

  const hasStatus = fd.has("status");
  const hasPlannedDate = fd.has("plannedDate");
  const hasCustomerName = fd.has("customerName");
  const hasCity = fd.has("city");
  const hasPhone = fd.has("phone");
  const hasAddress = fd.has("address");
  const hasInitialArea = fd.has("initialArea");
  const hasSelectedPanel = fd.has("selectedPanel");
  const hasNotes = fd.has("notes");

  const statusRaw = hasStatus ? String(fd.get("status") ?? "") : "";
  const plannedDateRaw = hasPlannedDate ? String(fd.get("plannedDate") ?? "") : "";
  const customerName = hasCustomerName ? String(fd.get("customerName") ?? "").trim() : null;
  const city = hasCity ? String(fd.get("city") ?? "").trim() : null;
  const phone = hasPhone ? String(fd.get("phone") ?? "").trim() : null;
  const address = hasAddress ? String(fd.get("address") ?? "").trim() : null;
  const initialAreaRaw = hasInitialArea ? String(fd.get("initialArea") ?? "").trim() : null;
  const selectedPanel = hasSelectedPanel ? String(fd.get("selectedPanel") ?? "").trim() : null;
  const notes = hasNotes ? String(fd.get("notes") ?? "").trim() : null;

  const data: Prisma.OrderUpdateInput = {};

  if (hasPlannedDate) {
    const plannedDate = plannedDateRaw ? new Date(plannedDateRaw) : null;
    if (plannedDate && !isNaN(plannedDate.getTime())) data.plannedDate = plannedDate;
    if (!plannedDateRaw) data.plannedDate = null;
  }

  if (hasStatus && statusRaw) {
    const status = statusRaw as OrderStatus;
    if (Object.values(OrderStatus).includes(status)) data.status = status;
  }

  if (hasCustomerName) data.customerName = customerName || null;
  if (hasCity) data.city = city || null;
  if (hasPhone) data.phone = phone || null;
  if (hasAddress) data.address = address || null;
  if (hasSelectedPanel) data.selectedPanel = selectedPanel || null;
  if (hasNotes) data.notes = notes || null;

  if (hasInitialArea) {
    if (initialAreaRaw) {
      const initialArea = Number(initialAreaRaw.replace(",", "."));
      if (Number.isFinite(initialArea) && initialArea > 0) {
        data.initialArea = initialArea;
      }
    } else {
      data.initialArea = null;
    }
  }

  if (!Object.keys(data).length) return { error: "Brak zmian." };

  const updated = await prisma.order.update({
    where: { id },
    data,
    select: { city: true, customerName: true, measuredArea: true, initialArea: true, assignedToId: true },
  });

  await prisma.order.update({
    where: { id },
    data: {
      title: buildOrderTitle({
        city: updated.city,
        customerName: updated.customerName ?? undefined,
        measuredArea: updated.measuredArea ?? undefined,
        fallbackArea: updated.initialArea ?? undefined,
      }),
    },
  });

  revalidatePath("/panel-admin/zlecenia");
  revalidatePath("/panel-montazysty/zlecenia");
  if (updated.assignedToId) {
    revalidatePath(`/panel-montazysty/zlecenia/${id}`);
  }
  return { ok: true };
}

export async function assignOrderAction(fd: FormData): Promise<ActionResult> {
  if (!(await assertAdmin())) return { error: "Brak uprawnień." };
  const id = Number(fd.get("id"));
  const assignedToIdRaw = String(fd.get("assignedToId") ?? "");
  if (!id) return { error: "Brak ID." };

  const assignedToId = assignedToIdRaw ? Number(assignedToIdRaw) : null;
  if (assignedToIdRaw && isNaN(assignedToId!)) return { error: "Niepoprawny monter." };

  await prisma.order.update({ where: { id }, data: { assignedToId: assignedToId ?? null } });
  revalidatePath("/panel-admin/zlecenia");
  revalidatePath("/panel-montazysty/zlecenia");
  revalidatePath(`/panel-montazysty/zlecenia/${id}`);
  return { ok: true };
}

export async function deleteOrderAction(fd: FormData): Promise<ActionResult> {
  if (!(await assertAdmin())) return { error: "Brak uprawnień." };
  const id = Number(fd.get("id"));
  if (!id) return { error: "Brak ID." };
  await prisma.order.delete({ where: { id } });
  revalidatePath("/panel-admin/zlecenia");
  revalidatePath("/panel-montazysty/zlecenia");
  revalidatePath(`/panel-montazysty/zlecenia/${id}`);
  return { ok: true };
}
