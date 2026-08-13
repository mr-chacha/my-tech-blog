import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase-admin";
import { verifyToken, isAdmin } from "@/lib/auth";

// GET /api/firebase/portfolio/:id - 단건 조회 (누구나)
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const doc = await getDb().collection("portfolio").doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Portfolio item not found" }, { status: 404 });
    }

    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
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

    const { id } = params;
    const data = await request.json();
    const { title, description, image, type, url, downloadUrl, githubUrl } = data;

    if (!title?.trim() || !description?.trim() || !type) {
      return NextResponse.json({ error: "title, description, type are required" }, { status: 400 });
    }

    if (type !== "web" && type !== "app") {
      return NextResponse.json({ error: "type must be web or app" }, { status: 400 });
    }

    const docRef = getDb().collection("portfolio").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Portfolio item not found" }, { status: 404 });
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      image: image || "",
      type,
      url: type === "web" ? url?.trim() || "" : "",
      downloadUrl: type === "app" ? downloadUrl?.trim() || url?.trim() || "" : "",
      githubUrl: githubUrl?.trim() || "",
      updatedAt: new Date(),
    };

    await docRef.update(payload);

    return NextResponse.json({ id, ...payload, message: "Portfolio updated successfully" });
  } catch (error) {
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

    const { id } = params;
    const docRef = getDb().collection("portfolio").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Portfolio item not found" }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({ message: "Portfolio deleted successfully" });
  } catch (error) {
    console.error("Delete portfolio error:", error);
    return NextResponse.json({ error: "Failed to delete portfolio" }, { status: 500 });
  }
}
