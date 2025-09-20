// app/api/db-check/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.count();
  return NextResponse.json({ ok: true, users });
}
