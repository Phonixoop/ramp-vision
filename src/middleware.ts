// /middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { Permission, User } from "~/types";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.SECRET });

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  const user = token.user as User;

  if (req.nextUrl.pathname.startsWith("/admin")) {
    // check role maybe

    if (!user.role.permissions)
      return NextResponse.redirect(new URL("/", req.url));

    const permissions: Permission[] = JSON.parse(user.role?.permissions);

    const permission = permissions.find((p) => p.id === "ViewAdmin");
    if (!permission || permission?.isActive === false) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  }

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
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};

const fileExists = async (url) => {
  try {
    const response = await fetch(url, { method: "HEAD" });

    return response.ok;
  } catch (error) {
    console.error("Error fetching the file:", error);
    return false;
  }
};
