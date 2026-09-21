import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) return NextResponse.redirect(new URL("/login", request.url));

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const role = String(payload.role ?? "");
    const pathname = request.nextUrl.pathname;

    if (pathname.startsWith("/admin")) {
      if (role !== "admin") {
        return NextResponse.redirect(new URL(role === "murid" ? "/student" : "/login", request.url));
      }
      return NextResponse.next();
    }

    if (pathname.startsWith("/student")) {
      const allowedRoles = ["murid", "guru", "kepsek", "wakakurikulum"];
      if (!allowedRoles.includes(role)) {
        return NextResponse.redirect(new URL(role === "admin" ? "/admin" : "/login", request.url));
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = { matcher: ["/admin/:path*", "/student/:path*"] };