"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Role, OrderStatus } from "@prisma/client";

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
  return { ok: true };
}
