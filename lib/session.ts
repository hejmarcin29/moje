import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import crypto from "crypto";

const sha256 = (v: string) => crypto.createHash("sha256").update(v,"utf8").digest("hex");

export async function getSession() {
  const token = cookies().get("session")?.value;
  if (!token) return null;
  const tokenHash = sha256(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) return null;
  if (!session.user.isActive) return null;
  return { user: session.user, session };
}
