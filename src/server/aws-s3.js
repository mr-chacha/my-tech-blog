import AWS from "aws-sdk";

// AWS SDK 설정
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

export const uploadToS3 = async (fileName, file) => {
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: file,
    ContentType: file.type,
    // ACL: "public-read", // 이 줄 삭제 또는 주석 처리
  };

  try {
    const result = await s3.upload(uploadParams).promise();
    console.log("S3 업로드 성공:", result.Location);
    return result.Location;
  } catch (error) {
    console.error("S3 업로드 실패:", error);
    throw error;
  }
};

export const deleteFromS3 = async (fileName) => {
  const deleteParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
  };

  try {
    await s3.deleteObject(deleteParams).promise();
    console.log(`파일 삭제 성공: ${fileName}`);
  } catch (error) {
    console.error("S3 삭제 실패:", error);
    throw error;
  }
};
