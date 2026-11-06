import { saveResource, deleteResource } from "@/lib/resource-store";
import { revalidatePath } from "next/cache";
import { optionalUrl, InputError } from "@/lib/post-input.mjs";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase-admin";
import { verifyToken, isAdmin } from "@/lib/auth";

// GET /api/firebase/portfolio - 포트폴리오 목록 (누구나)
export async function GET() {
  try {
    const snapshot = await (await getDb()).collection("portfolio").orderBy("createdAt", "desc").get();
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(items);
  } catch (error) {
    if (error instanceof InputError || error instanceof SyntaxError) return NextResponse.json({ error: error.message }, { status: error.status || 400 });
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

    if (typeof title !== "string" || typeof description !== "string" || !title.trim() || !description.trim() || title.length > 200 || description.length > 10000 || !type) {
      return NextResponse.json({ error: "title, description, type are required" }, { status: 400 });
    }

    if (type !== "web" && type !== "app") {
      return NextResponse.json({ error: "type must be web or app" }, { status: 400 });
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      image: optionalUrl(image, "이미지", true),
      type,
      url: type === "web" ? optionalUrl(url, "사이트 URL") : "",
      downloadUrl: type === "app" ? optionalUrl(downloadUrl || url, "다운로드 URL") : "",
      githubUrl: optionalUrl(githubUrl, "GitHub URL"),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const id = await saveResource("portfolio", null, payload, user, "create");

    revalidatePath("/portfolio");
    return NextResponse.json({ id, ...payload }, { status: 201 });
  } catch (error) {
    if (error instanceof InputError || error instanceof SyntaxError) return NextResponse.json({ error: error.message }, { status: error.status || 400 });
    console.error("Create portfolio error:", error);
    return NextResponse.json({ error: "Failed to create portfolio" }, { status: 500 });
  }
}
