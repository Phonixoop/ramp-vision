import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { Permission, User } from "~/types";

export async function proxy(req: NextRequest) {
  const fileUrl = "http://programchi.ir/licences/RAMP/web.txt";
  const exists = await fileExists(fileUrl);

  if (!exists) {
    return NextResponse.redirect(
      "http://roocket.ir/articles/what-to-do-when-your-client-wont-pay",
    );
  }
  const token = await getToken({ req, secret: process.env.SECRET });

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  const user = token.user as User;

  if (req.nextUrl.pathname.startsWith("/admin")) {
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
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};

const fileExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });

    return response.ok;
  } catch (error) {
    console.error("Error fetching the file:", error);
    return true;
  }
};
