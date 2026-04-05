import { NextResponse } from "next/server";
import AWS from "aws-sdk";
import { verifyToken, isAdmin } from "@/lib/auth";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

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

    const buffer = Buffer.from(fileData, "base64");

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: fileType,
    };

    const result = await s3.upload(uploadParams).promise();

    return NextResponse.json({ url: result.Location });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
