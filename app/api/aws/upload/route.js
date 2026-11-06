import { randomUUID } from "node:crypto";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { readUploadJson, validateUpload } from "@/lib/upload-validation.mjs";
import { InputError } from "@/lib/post-input.mjs";
import { NextResponse } from "next/server";
import { verifyToken, isAdmin } from "@/lib/auth";
import { getDb } from "@/lib/firebase-admin";
import { getS3Client, getS3Bucket, assertPrivateBucket } from "@/lib/s3";
import { mediaUrl } from "@/common/util/media-refs.mjs";
export async function POST(request) {
  try {
    const user = await verifyToken(request);
    if (!isAdmin(user)) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    const { buffer, type, key } = await validateUpload(await readUploadJson(request));
    const bucket = getS3Bucket(), s3 = getS3Client();
    await assertPrivateBucket(s3, bucket);
    const id = randomUUID();
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: type, CacheControl: "private, no-store" }));
    try {
      await (await getDb()).collection("media").doc(id).create({ key, bucket, type, size: buffer.length, ownerUid: user.uid, resourceId: null, resourceType: null, createdAt: new Date() });
    } catch (error) { await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key })).catch(() => {}); throw error; }
    return NextResponse.json({ id, url: mediaUrl(id), key });
  } catch (error) {
    if (error instanceof InputError || error instanceof SyntaxError) return NextResponse.json({ error: error.message }, { status: error.status || 400 });
    console.error("Upload failed:", error.name);
    return NextResponse.json({ error: "파일을 업로드하지 못했습니다." }, { status: 503 });
  }
}
