import { getAuth } from "./firebase-admin";

// Next.js API Route에서 사용하는 토큰 검증 헬퍼
export const verifyToken = async (request) => {
  try {
    const token = request.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) return null;

    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};

export const isAdmin = (user) => {
  return user?.email === process.env.ADMIN_EMAIL;
};
