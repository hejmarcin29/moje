import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const redirectUrl = new URL("/", request.url);
  const res = NextResponse.redirect(redirectUrl);
  const isDev = process.env.NODE_ENV === "development";
  const cookieOptions: {
    name: string;
    value: string;
    httpOnly: boolean;
    sameSite: "lax" | "strict" | "none";
    path: string;
    maxAge: number;
    secure: boolean;
    domain?: string;
  } = {
    name: "session",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: !isDev,
  };
  if (redirectUrl.hostname && redirectUrl.hostname !== "localhost") {
    cookieOptions.domain = redirectUrl.hostname;
  }
  res.cookies.set(cookieOptions);
  return res;
}
