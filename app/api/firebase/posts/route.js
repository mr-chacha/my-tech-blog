import { revalidatePath } from "next/cache";
import { getPostPage } from "@/lib/posts";
import { InputError, validatePostInput } from "@/lib/post-input.mjs";
import { NextResponse } from "next/server";
import { saveResource } from "@/lib/resource-store";
import { verifyToken, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Public and administrator list responses are never shared by a cache.
export async function GET(request) {
  try {
    const user = await verifyToken(request);
    const posts = await getPostPage(new URL(request.url).searchParams, isAdmin(user));
    return NextResponse.json(posts, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof InputError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Get posts error:", error?.message);
    return NextResponse.json({ error: "게시물을 불러오지 못했습니다." }, { status: 500 });
  }
}

// POST /api/firebase/posts - 포스트 생성 (관리자 전용)
export async function POST(request) {
  try {
    const user = await verifyToken(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const postData = validatePostInput(await request.json());
    const id = await saveResource("posts", null, postData, user, "create");

    revalidatePath("/");
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    if (error instanceof InputError || error instanceof SyntaxError) return NextResponse.json({ error: error.message }, { status: error.status || 400 });
    console.error("Create post error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
