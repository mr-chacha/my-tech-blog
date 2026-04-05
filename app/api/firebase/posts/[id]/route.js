import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { verifyToken, isAdmin } from "@/lib/auth";

// GET /api/firebase/posts/:id - 포스트 상세 조회
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const doc = await db.collection("posts").doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Get post error:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

// PUT /api/firebase/posts/:id - 포스트 수정 (관리자 전용)
export async function PUT(request, { params }) {
  try {
    const user = await verifyToken(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = params;
    const updateData = await request.json();
    await db.collection("posts").doc(id).update({
      ...updateData,
      updatedAt: new Date(),
    });

    return NextResponse.json({ message: "Post updated successfully" });
  } catch (error) {
    console.error("Update post error:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

// DELETE /api/firebase/posts/:id - 포스트 삭제 (관리자 전용)
export async function DELETE(request, { params }) {
  try {
    const user = await verifyToken(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = params;
    await db.collection("posts").doc(id).delete();

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
