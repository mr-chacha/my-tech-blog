import AWS from "aws-sdk";

function getS3Config() {
  return {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.S3_REGION || process.env.AWS_REGION || "ap-northeast-2",
  };
}

export function getS3Bucket() {
  return process.env.S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME;
}

export function getS3Client() {
  const config = getS3Config();
  AWS.config.update(config);
  return new AWS.S3();
}
