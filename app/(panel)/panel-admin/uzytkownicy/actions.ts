"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export type ActionResult = { ok?: true; error?: string };

async function assertAdmin(): Promise<boolean> {
  const s = await getSession();
  return !!(s && s.user.role === Role.ADMIN);
}

export async function createUserAction(formData: FormData): Promise<ActionResult> {
  if (!(await assertAdmin())) return { error: "Brak uprawnień." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const firstName = String(formData.get("firstName") ?? "").trim() || null;
  const role = String(formData.get("role") ?? "");
  const password = String(formData.get("password") ?? "");
  const password2 = String(formData.get("password2") ?? "");

  if (!email || !email.includes("@")) return { error: "Podaj poprawny e-mail." };
  if (!["ADMIN", "MONTAZYSTA"].includes(role)) return { error: "Niepoprawna rola." };
  if (password.length < 8) return { error: "Hasło min. 8 znaków." };
  if (password !== password2) return { error: "Hasła się różnią." };

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "Użytkownik z takim e-mailem już istnieje." };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, firstName, role: role as Role, passwordHash, isActive: true },
  });

  revalidatePath("/panel-admin/uzytkownicy");
  return { ok: true };
}

export async function updateUserAction(formData: FormData): Promise<ActionResult> {
  if (!(await assertAdmin())) return { error: "Brak uprawnień." };

  const id = Number(formData.get("id"));
  const firstName = String(formData.get("firstName") ?? "").trim() || null;
  const role = String(formData.get("role") ?? "");

  if (!id) return { error: "Brak ID." };
  if (!["ADMIN", "MONTAZYSTA"].includes(role)) return { error: "Niepoprawna rola." };

  await prisma.user.update({ where: { id }, data: { firstName, role: role as Role } });
  revalidatePath("/panel-admin/uzytkownicy");
  return { ok: true };
}

export async function toggleActiveAction(formData: FormData): Promise<ActionResult> {
  if (!(await assertAdmin())) return { error: "Brak uprawnień." };

  const id = Number(formData.get("id"));
  const active = String(formData.get("active")) === "true";
  if (!id) return { error: "Brak ID." };

  await prisma.user.update({ where: { id }, data: { isActive: !active } });
  revalidatePath("/panel-admin/uzytkownicy");
  return { ok: true };
}

export async function resetPasswordAction(formData: FormData): Promise<ActionResult> {
  if (!(await assertAdmin())) return { error: "Brak uprawnień." };

  const id = Number(formData.get("id"));
  const pass1 = String(formData.get("password") ?? "");
  const pass2 = String(formData.get("password2") ?? "");
  if (!id) return { error: "Brak ID." };
  if (pass1.length < 8) return { error: "Hasło min. 8 znaków." };
  if (pass1 !== pass2) return { error: "Hasła się różnią." };

  const passwordHash = await bcrypt.hash(pass1, 10);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
  revalidatePath("/panel-admin/uzytkownicy");
  return { ok: true };
}
