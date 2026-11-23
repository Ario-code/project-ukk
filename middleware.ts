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
        return NextResponse.redirect(
          new URL(
            role === "guru" ? "/guru" : role === "wakakurikulum" ? "/kurikulum" : role === "kepsek" ? "/kepsek" : role === "murid" ? "/student" : "/login",
            request.url
          )
        );
      }
      return NextResponse.next();
    }

    if (pathname.startsWith("/kepsek")) {
      if (role !== "kepsek") {
        return NextResponse.redirect(
          new URL(role === "admin" ? "/admin" : role === "guru" ? "/guru" : role === "wakakurikulum" ? "/kurikulum" : "/student", request.url)
        );
      }
      return NextResponse.next();
    }

    if (pathname.startsWith("/kurikulum")) {
      if (role !== "wakakurikulum") {
        return NextResponse.redirect(
          new URL(role === "admin" ? "/admin" : role === "guru" ? "/guru" : role === "kepsek" ? "/kepsek" : "/student", request.url)
        );
      }
      return NextResponse.next();
    }

    if (pathname.startsWith("/student")) {
      const allowedStudentRoles = ["murid", "guru", "kepsek"];
      if (role === "kepsek") return NextResponse.redirect(new URL("/kepsek", request.url));
      if (role === "wakakurikulum") return NextResponse.redirect(new URL("/kurikulum", request.url));
      if (!allowedStudentRoles.includes(role)) {
        return NextResponse.redirect(
          new URL(role === "admin" ? "/admin" : role === "guru" ? "/guru" : "/login", request.url)
        );
      }
      return NextResponse.next();
    }

    if (pathname.startsWith("/guru")) {
      if (role !== "guru") {
        return NextResponse.redirect(
          new URL(
            ["murid", "kepsek"].includes(role) ? (role === "kepsek" ? "/kepsek" : "/student") : role === "wakakurikulum" ? "/kurikulum" : role === "admin" ? "/admin" : "/login",
            request.url
          )
        );
      }
      return NextResponse.next();
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = { matcher: ["/admin/:path*", "/student/:path*", "/guru/:path*", "/kepsek/:path*", "/kurikulum/:path*"] };