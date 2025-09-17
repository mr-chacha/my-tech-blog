const AWS = require("aws-sdk");

// AWS SDK 설정
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const uploadToS3 = async (fileName, file) => {
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer, // multer의 경우 buffer 사용
    ContentType: file.mimetype,
  };

  try {
    const result = await s3.upload(uploadParams).promise();
    return result.Location;
  } catch (error) {
    console.error("S3 업로드 실패:", error);
    throw error;
  }
};

const deleteFromS3 = async (fileName) => {
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

module.exports = {
  uploadToS3,
  deleteFromS3,
};
