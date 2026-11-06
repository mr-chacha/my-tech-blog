import { NextResponse } from "next/server";
import { getAuth } from "@/lib/firebase-admin";
import { verifyToken, isAdmin, SESSION_COOKIE } from "@/lib/auth";
const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/" };
const sameOrigin = (request) => {
  const supplied = request.headers.get("origin");
  if (!supplied) return false;
  try {
    const origin = new URL(supplied), url = new URL(request.url);
    // Next.js normalizes loopback URLs to localhost; use the browser's Host
    // header as well, so a same-origin 127.0.0.1 development request still works.
    return origin.origin === url.origin || (origin.host === request.headers.get("host") && origin.protocol === url.protocol);
  } catch { return false; }
};
export async function POST(request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const user = await verifyToken(request);
  if (!isAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const token = request.headers.get("authorization").slice(7);
    const cookie = await (await getAuth()).createSessionCookie(token, { expiresIn: 24 * 60 * 60 * 1000 });
    const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
    response.cookies.set(SESSION_COOKIE, cookie, { ...options, maxAge: 24 * 60 * 60 });
    return response;
  } catch { return NextResponse.json({ error: "인증 세션을 만들지 못했습니다." }, { status: 401 }); }
}
export async function DELETE(request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { ...options, maxAge: 0 });
  return response;
}
