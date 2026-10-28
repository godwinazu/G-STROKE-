import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.R2_REGION || 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true,
});

export async function createR2PresignedUploadUrl({ key, contentType }: { key: string; contentType: string }) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME || '',
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 60 * 10 });

  return {
    url,
    key,
  };
}

export async function createR2DownloadUrl(key: string, expiresIn = 60 * 60 * 24) {
  const { GetObjectCommand } = await import('@aws-sdk/client-s3');
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME || '',
    Key: key,
  });

  return getSignedUrl(s3, command, { expiresIn });
}
