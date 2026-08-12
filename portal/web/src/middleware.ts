import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  apiUrl,
  type Session,
} from "@/lib/session";

export async function middleware(request: NextRequest) {
  if (request.cookies.has(ACCESS_COOKIE) || !request.cookies.has(REFRESH_COOKIE)) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  try {
    const response = await fetch(`${apiUrl}/v1/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!response.ok) throw new Error("refresh rejected");
    const session = (await response.json()) as Session;
    const next = NextResponse.next();
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };
    next.cookies.set(ACCESS_COOKIE, session.accessToken, {
      ...options,
      expires: new Date(session.expiresAt),
    });
    next.cookies.set(REFRESH_COOKIE, session.refreshToken, {
      ...options,
      expires: new Date(session.refreshExpiresAt),
    });
    return next;
  } catch {
    const next = NextResponse.next();
    next.cookies.delete(ACCESS_COOKIE);
    next.cookies.delete(REFRESH_COOKIE);
    return next;
  }
}

export const config = { matcher: ["/painel/:path*"] };
