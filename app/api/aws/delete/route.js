import { NextResponse } from "next/server";
import AWS from "aws-sdk";
import { verifyToken, isAdmin } from "@/lib/auth";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

// DELETE /api/aws/delete - 이미지 S3 삭제 (관리자 전용)
export async function DELETE(request) {
  try {
    const user = await verifyToken(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { fileName } = await request.json();

    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
    };

    await s3.deleteObject(deleteParams).promise();

    return NextResponse.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
