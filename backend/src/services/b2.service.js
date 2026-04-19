const {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3 = new S3Client({
  endpoint: process.env.B2_ENDPOINT,
  region: 'us-west-004',
  credentials: {
    accessKeyId: process.env.B2_ACCOUNT_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
  },
  forcePathStyle: true,
});

const BUCKET = process.env.B2_BUCKET_NAME;

async function uploadFile(buffer, key, mimeType) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }),
  );

  return `${process.env.B2_ENDPOINT}/${BUCKET}/${key}`;
}

async function getPresignedUrl(key, expiresIn = 3600) {
  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }),
    { expiresIn },
  );
}

async function deleteFile(key) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }),
  );

  return true;
}

function generateKey(userId, filename) {
  return `vault/${userId}/${Date.now()}-${filename}`;
}

module.exports = {
  uploadFile,
  getPresignedUrl,
  deleteFile,
  generateKey,
};
