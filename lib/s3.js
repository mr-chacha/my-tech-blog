import "server-only";
import { S3Client } from "@aws-sdk/client-s3";

export function getS3Bucket() {
  const bucket = process.env.S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME;
  if (!bucket || !/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket)) throw new Error("S3_BUCKET_NAME is required");
  return bucket;
}

function getRegion() {
  const region = process.env.S3_REGION || process.env.AWS_REGION || "ap-northeast-2";
  if (!/^[a-z]{2}(?:-[a-z]+)+-\d+$/.test(region)) throw new Error("Invalid S3 region");
  return region;
}

export function getS3Client() {
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  return new S3Client({
    region: getRegion(),
    ...(accessKeyId && secretAccessKey ? { credentials: { accessKeyId, secretAccessKey } } : {}),
  });
}


export async function assertPrivateBucket(client, bucket) {
  const { GetPublicAccessBlockCommand } = await import("@aws-sdk/client-s3");
  const result = await client.send(new GetPublicAccessBlockCommand({ Bucket: bucket }));
  if (!["BlockPublicAcls", "IgnorePublicAcls", "BlockPublicPolicy", "RestrictPublicBuckets"].every((key) => result.PublicAccessBlockConfiguration?.[key] === true)) {
    throw new Error("Media bucket must block all public access");
  }
}
