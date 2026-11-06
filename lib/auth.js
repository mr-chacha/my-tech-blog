import "server-only";
import { getAuth } from "./firebase-admin";

// Next.js API Route에서 사용하는 토큰 검증 헬퍼
export const verifyToken = async (request) => {
  try {
    const token = request.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) return null;

    const decodedToken = await (await getAuth()).verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};

export const isAdmin = (user) => {
  const email = process.env.ADMIN_EMAIL?.trim();
  return Boolean(email && user?.email && user.email === email && user.email_verified);
};

export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-blog_admin_session" : "blog_admin_session";
export async function verifyMediaUser(request) {
  const bearer = await verifyToken(request);
  if (isAdmin(bearer)) return bearer;
  const raw = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
  if (!raw) return null;
  try {
    const user = await (await getAuth()).verifySessionCookie(raw, true);
    return isAdmin(user) ? user : null;
  } catch { return null; }
}
