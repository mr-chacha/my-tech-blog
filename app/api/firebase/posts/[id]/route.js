export const dynamic = "force-dynamic";

import { saveResource, deleteResource } from "@/lib/resource-store";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { isPublicPost, serializePost } from "@/lib/posts";
import { InputError, validatePostInput } from "@/lib/post-input.mjs";
import { verifyToken, isAdmin } from "@/lib/auth";

// GET /api/firebase/posts/:id - 포스트 상세 조회
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const doc = await (await getDb()).collection("posts").doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const post = { id: doc.id, ...doc.data() };
    if (!isPublicPost(post)) {
      const user = await verifyToken(request);
      if (!isAdmin(user)) return NextResponse.json({ error: "Post not found" }, { status: 404, headers: { "Cache-Control": "private, no-store" } });
    }
    return NextResponse.json(serializePost(post), { headers: { "Cache-Control": "private, no-store" } });
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

    const { id } = await params;
    const updateData = validatePostInput(await request.json());
    await saveResource("posts", id, updateData, user);

    revalidatePath("/");
    revalidatePath(`/post/${id}`);
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ message: "Post updated successfully" });
  } catch (error) {
    if (error instanceof InputError || error instanceof SyntaxError) return NextResponse.json({ error: error.message }, { status: error.status || 400 });
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

    const { id } = await params;
    await deleteResource("posts", id);

    revalidatePath("/");
    revalidatePath(`/post/${id}`);
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    if (error instanceof InputError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Delete post error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
