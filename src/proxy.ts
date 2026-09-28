import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, sessionSecret, verifySessionToken } from "@/lib/auth/session-token";

// Нэвтрээгүй хэрэглэгчийг админ хуудсаас нэвтрэх хуудас руу шилжүүлнэ.
// Server action бүр requireAdmin()-аар дахин шалгадаг тул энэ нь эхний давхарга юм.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const valid = await verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value, sessionSecret());
  if (valid) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
