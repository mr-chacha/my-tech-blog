import { saveResource, deleteResource } from "@/lib/resource-store";
import { revalidatePath } from "next/cache";
import { optionalUrl, InputError } from "@/lib/post-input.mjs";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase-admin";
import { verifyToken, isAdmin } from "@/lib/auth";

// GET /api/firebase/portfolio/:id - 단건 조회 (누구나)
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const doc = await (await getDb()).collection("portfolio").doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Portfolio item not found" }, { status: 404 });
    }

    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    if (error instanceof InputError || error instanceof SyntaxError) return NextResponse.json({ error: error.message }, { status: error.status || 400 });
    console.error("Get portfolio item error:", error);
    return NextResponse.json({ error: "Failed to fetch portfolio item" }, { status: 500 });
  }
}

// PUT /api/firebase/portfolio/:id - 수정 (관리자 전용)
export async function PUT(request, { params }) {
  try {
    const user = await verifyToken(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();
    const { title, description, image, type, url, downloadUrl, githubUrl } = data;

    if (typeof title !== "string" || typeof description !== "string" || !title.trim() || !description.trim() || title.length > 200 || description.length > 10000 || !type) {
      return NextResponse.json({ error: "title, description, type are required" }, { status: 400 });
    }

    if (type !== "web" && type !== "app") {
      return NextResponse.json({ error: "type must be web or app" }, { status: 400 });
    }

    const payload = {
      title: title.trim(), description: description.trim(), image: optionalUrl(image, "이미지", true), type,
      url: type === "web" ? optionalUrl(url, "사이트 URL") : "",
      downloadUrl: type === "app" ? optionalUrl(downloadUrl || url, "다운로드 URL") : "",
      githubUrl: optionalUrl(githubUrl, "GitHub URL"),
    };
    await saveResource("portfolio", id, payload, user);

    revalidatePath("/portfolio");
    return NextResponse.json({ id, ...payload, message: "Portfolio updated successfully" });
  } catch (error) {
    if (error instanceof InputError || error instanceof SyntaxError) return NextResponse.json({ error: error.message }, { status: error.status || 400 });
    console.error("Update portfolio error:", error);
    return NextResponse.json({ error: "Failed to update portfolio" }, { status: 500 });
  }
}

// DELETE /api/firebase/portfolio/:id - 삭제 (관리자 전용)
export async function DELETE(request, { params }) {
  try {
    const user = await verifyToken(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    await deleteResource("portfolio", id);

    revalidatePath("/portfolio");
    return NextResponse.json({ message: "Portfolio deleted successfully" });
  } catch (error) {
    if (error instanceof InputError || error instanceof SyntaxError) return NextResponse.json({ error: error.message }, { status: error.status || 400 });
    console.error("Delete portfolio error:", error);
    return NextResponse.json({ error: "Failed to delete portfolio" }, { status: 500 });
  }
}
