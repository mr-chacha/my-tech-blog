import { NextResponse } from "next/server";
import { verifyToken, isAdmin } from "@/lib/auth";
import { getS3Client, getS3Bucket } from "@/lib/s3";

// DELETE /api/aws/delete - 이미지 S3 삭제 (관리자 전용)
export async function DELETE(request) {
  try {
    const user = await verifyToken(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { fileName } = await request.json();
    const bucket = getS3Bucket();
    if (!bucket) {
      return NextResponse.json({ error: "S3 bucket is not configured" }, { status: 500 });
    }

    const s3 = getS3Client();
    await s3
      .deleteObject({
        Bucket: bucket,
        Key: fileName,
      })
      .promise();

    return NextResponse.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
