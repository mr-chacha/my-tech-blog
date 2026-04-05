import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// POST /api/github/verify - GitHub 로그인 후 관리자 여부 확인
export async function POST(request) {
  try {
    const user = await verifyToken(request);

    if (!user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    return NextResponse.json({ isAdmin: user.email === process.env.ADMIN_EMAIL });
  } catch (error) {
    console.error("GitHub verify error:", error);
    return NextResponse.json({ error: "Failed to verify user" }, { status: 500 });
  }
}
