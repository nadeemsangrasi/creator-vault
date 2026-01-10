import { betterFetch } from "@better-fetch/fetch";
import { type Session, type User } from "better-auth";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    }
  );

  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (!session && request.nextUrl.pathname.startsWith("/ideas")) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (session && request.nextUrl.pathname.startsWith("/signin")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (session && request.nextUrl.pathname.startsWith("/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/ideas/:path*", "/signin", "/signup"],
};
