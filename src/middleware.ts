// /middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { User } from "@prisma/client";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.SECRET });

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  //   const user = token.user as User;
  //   if (req.nextUrl.pathname.startsWith("/admin")) {
  //     // check role maybe
  //     return NextResponse.redirect(new URL("/", req.url));
  //   }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    // "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/user/:path*",
    "/admin/:path*",
  ],
};
