import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase-admin";
import { verifyToken, isAdmin } from "@/lib/auth";

// GET /api/firebase/portfolio - 포트폴리오 목록 (누구나)
export async function GET() {
  try {
    const snapshot = await getDb().collection("portfolio").orderBy("createdAt", "desc").get();
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error("Get portfolio error:", error);
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
  }
}

// POST /api/firebase/portfolio - 포트폴리오 등록 (관리자 전용)
export async function POST(request) {
  try {
    const user = await verifyToken(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const data = await request.json();
    const { title, description, image, type, url, downloadUrl, githubUrl } = data;

    if (!title?.trim() || !description?.trim() || !type) {
      return NextResponse.json({ error: "title, description, type are required" }, { status: 400 });
    }

    if (type !== "web" && type !== "app") {
      return NextResponse.json({ error: "type must be web or app" }, { status: 400 });
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      image: image || "",
      type,
      url: type === "web" ? url?.trim() || "" : "",
      downloadUrl: type === "app" ? downloadUrl?.trim() || url?.trim() || "" : "",
      githubUrl: githubUrl?.trim() || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await getDb().collection("portfolio").add(payload);

    return NextResponse.json({ id: docRef.id, ...payload }, { status: 201 });
  } catch (error) {
    console.error("Create portfolio error:", error);
    return NextResponse.json({ error: "Failed to create portfolio" }, { status: 500 });
  }
}
