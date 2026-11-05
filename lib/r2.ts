import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let client: S3Client | undefined;

function getClient() {
  if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    throw new Error('Cloudflare R2 is not configured');
  }

  client ||= new S3Client({
    region: process.env.R2_REGION || 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });
  return client;
}

export async function createR2PresignedUploadUrl({
  key,
  contentType,
  bucketName,
}: {
  key: string;
  contentType: string;
  bucketName: string;
}) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(getClient(), command, { expiresIn: 60 * 10 });

  return {
    url,
    key,
  };
}

export async function createR2DownloadUrl(key: string, expiresIn = 60 * 60 * 24) {
  if (!process.env.R2_BUCKET_NAME) throw new Error('Private R2 bucket is not configured');
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(getClient(), command, { expiresIn });
}
