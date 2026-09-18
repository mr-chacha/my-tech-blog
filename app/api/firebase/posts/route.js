import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase-admin";
import { verifyToken, isAdmin } from "@/lib/auth";

// GET /api/firebase/posts - 전체 포스트 조회
export async function GET(request) {
  try {
    const user = await verifyToken(request);

    const snapshot = await getDb().collection("posts").orderBy("createdAt", "desc").get();
    let posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 일반 사용자는 공개 포스트만 조회
    if (!user || !isAdmin(user)) {
      posts = posts.filter((post) => post.published !== false);
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Get posts error:", error?.message || error);
    const envStatus = {
      FIREBASE_PROJECT_ID: Boolean(process.env.FIREBASE_PROJECT_ID),
      FIREBASE_CLIENT_EMAIL: Boolean(process.env.FIREBASE_CLIENT_EMAIL),
      FIREBASE_PRIVATE_KEY: Boolean(process.env.FIREBASE_PRIVATE_KEY),
      FIREBASE_PRIVATE_KEY_BASE64: Boolean(process.env.FIREBASE_PRIVATE_KEY_BASE64),
    };
    return NextResponse.json(
      {
        error: "Failed to fetch posts",
        code: "FIREBASE_ADMIN_ERROR",
        // 값(시크릿)은 절대 포함하지 않음. 존재 여부만.
        envStatus,
        hint: "Amplify에 FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY 가 있는지 확인하고 재배포하세요.",
      },
      { status: 500 }
    );
  }
}

// POST /api/firebase/posts - 포스트 생성 (관리자 전용)
export async function POST(request) {
  try {
    const user = await verifyToken(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const postData = await request.json();
    const docRef = await getDb().collection("posts").add({
      ...postData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ id: docRef.id, ...postData }, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
