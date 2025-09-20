import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE = "session";
const PROTECTED = ["/dashboard", "/panel-admin", "/panel-montazysty"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!PROTECTED.some(p => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }
  if (!req.cookies.get(COOKIE)?.value) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("r", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard", "/dashboard/:path*",
    "/panel-admin", "/panel-admin/:path*",
    "/panel-montazysty", "/panel-montazysty/:path*",
  ],
};
