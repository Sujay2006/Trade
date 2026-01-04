import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

async function verifyJwt(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  let role: string | null = null;

  if (token) {
    const decoded = await verifyJwt(token);
    if (decoded) {
      role = decoded.role as string;
    } else {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.set("token", "", { maxAge: 0 });
      return response;
    }
  }

  // same logic as before...
  if (pathname === "/") {
    if (!token) {
      return NextResponse.next();
    } else if (role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  if (!token && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/unauth-page", request.url));
  }

  if (!token && ["/account", "/checkout"].includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
    const redirectPath = role === "admin" ? "/admin/dashboard" : "/";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (token && role !== "admin" && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/unauth-page", request.url));
  }

  if (
    token &&
    role === "admin" &&
    ["/account", "/checkout"].some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register", "/account", "/checkout", "/admin/:path*"],
};
// export const runtime = "edge";