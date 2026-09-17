import { NextResponse } from "next/server";
import { verifyToken, isAdmin } from "@/lib/auth";
import { getS3Client, getS3Bucket } from "@/lib/s3";

// POST /api/aws/upload - 이미지 S3 업로드 (관리자 전용)
export async function POST(request) {
  try {
    const user = await verifyToken(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { fileName, fileType, fileData } = await request.json();

    if (!fileName || !fileType || !fileData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bucket = getS3Bucket();
    if (!bucket) {
      return NextResponse.json({ error: "S3 bucket is not configured" }, { status: 500 });
    }

    const buffer = Buffer.from(fileData, "base64");
    const s3 = getS3Client();

    const result = await s3
      .upload({
        Bucket: bucket,
        Key: fileName,
        Body: buffer,
        ContentType: fileType,
      })
      .promise();

    return NextResponse.json({ url: result.Location });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
