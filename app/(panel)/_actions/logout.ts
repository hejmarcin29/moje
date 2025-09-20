"use server";

import { cookies } from "next/headers";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function signOutAction() {
  const jar = await cookies();
  const token = jar.get("session")?.value; // <-- jeśli masz inną nazwę cookie, zmień tu

  if (token) {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    await prisma.session.deleteMany({ where: { tokenHash } });
  }

  // wyczyść cookie
  jar.set("session", "", {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    expires: new Date(0),
  });
}
