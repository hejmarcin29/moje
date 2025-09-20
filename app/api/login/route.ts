export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const COOKIE = "session";
const SESSION_DAYS = 7;

const sha256 = (v: string) => crypto.createHash("sha256").update(v, "utf8").digest("hex");

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ ok:false, error:"Brak email/hasła." }, { status:400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    return NextResponse.json({ ok:false, error:"Nieprawidłowe dane." }, { status:401 });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ ok:false, error:"Nieprawidłowe dane." }, { status:401 });
  }

  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = sha256(token);
  const ua = req.headers.get("user-agent") || undefined;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        || req.headers.get("x-real-ip") || undefined;

  const expiresAt = new Date(Date.now() + SESSION_DAYS*24*60*60*1000);

  await prisma.session.create({
    data: { userId: user.id, tokenHash, userAgent: ua, ip: typeof ip==="string"? ip : undefined, expiresAt },
  });

  const res = NextResponse.json({ ok:true });
  res.cookies.set(COOKIE, token, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: SESSION_DAYS*24*60*60,
    // secure: true, // włącz w produkcji (HTTPS)
  });
  return res;
}
