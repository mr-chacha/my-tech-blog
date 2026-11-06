import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { verifyToken, isAdmin } from "@/lib/auth";
import { getDb } from "@/lib/firebase-admin";
import { getS3Client, getS3Bucket } from "@/lib/s3";
import { MEDIA_ID } from "@/common/util/media-refs.mjs";
export async function DELETE(request) {
  try {
    const user = await verifyToken(request);
    if (!isAdmin(user)) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    const { id } = await request.json();
    if (!MEDIA_ID.test(id || "")) return NextResponse.json({ error: "Invalid media ID" }, { status: 400 });
    const db = await getDb(), ref = db.collection("media").doc(id);
    // Mark before S3 deletion so a concurrent post save cannot claim a deleted object.
    const record = await db.runTransaction(async (tx) => {
      const doc = await tx.get(ref), data = doc.data();
      if (!data || data.ownerUid !== user.uid || data.resourceId || data.bucket !== getS3Bucket()) return null;
      tx.update(ref, { deleting: true }); return data;
    });
    if (!record) return NextResponse.json({ error: "첨부파일을 삭제할 수 없습니다." }, { status: 409 });
    if (!record.preserveObject) await getS3Client().send(new DeleteObjectCommand({ Bucket: record.bucket, Key: record.key }));
    await ref.delete();
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "파일을 삭제하지 못했습니다." }, { status: 503 }); }
}
