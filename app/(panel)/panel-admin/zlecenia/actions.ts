"use server";

import { revalidatePath } from "next/cache";
import { Role, OrderStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export type ActionResult = { ok?: true; error?: string };

async function assertAdmin(): Promise<boolean> {
  const s = await getSession();
  return !!(s && s.user.role === Role.ADMIN);
}

export async function createOrderAction(fd: FormData): Promise<ActionResult> {
  if (!(await assertAdmin())) return { error: "Brak uprawnień." };
  const title = String(fd.get("title") ?? "").trim();
  const customerName = String(fd.get("customerName") ?? "").trim() || null;
  const address = String(fd.get("address") ?? "").trim() || null;
  const plannedDateRaw = String(fd.get("plannedDate") ?? "") || null;
  const assignedToIdRaw = String(fd.get("assignedToId") ?? "") || "";

  if (!title) return { error: "Podaj tytuł zlecenia." };

  const plannedDate = plannedDateRaw ? new Date(plannedDateRaw) : null;
  const assignedToId = assignedToIdRaw ? Number(assignedToIdRaw) : null;
  if (assignedToId && isNaN(assignedToId)) return { error: "Niepoprawny monter." };

  await prisma.order.create({
    data: { title, customerName, address, plannedDate, assignedToId: assignedToId ?? null },
  });

  revalidatePath("/panel-admin/zlecenia");
  return { ok: true };
}

export async function updateOrderAction(fd: FormData): Promise<ActionResult> {
  if (!(await assertAdmin())) return { error: "Brak uprawnień." };
  const id = Number(fd.get("id"));
  if (!id) return { error: "Brak ID." };

  const title = String(fd.get("title") ?? "").trim();
  const status = String(fd.get("status") ?? "") as OrderStatus;
  const plannedDateRaw = String(fd.get("plannedDate") ?? "") || null;

  const data: any = {};
  if (title) data.title = title;
  if (plannedDateRaw) data.plannedDate = new Date(plannedDateRaw);
  if (status && Object.values(OrderStatus).includes(status)) data.status = status;

  if (!Object.keys(data).length) return { error: "Brak zmian." };

  await prisma.order.update({ where: { id }, data });
  revalidatePath("/panel-admin/zlecenia");
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
  return { ok: true };
}

export async function deleteOrderAction(fd: FormData): Promise<ActionResult> {
  if (!(await assertAdmin())) return { error: "Brak uprawnień." };
  const id = Number(fd.get("id"));
  if (!id) return { error: "Brak ID." };
  await prisma.order.delete({ where: { id } });
  revalidatePath("/panel-admin/zlecenia");
  return { ok: true };
}
