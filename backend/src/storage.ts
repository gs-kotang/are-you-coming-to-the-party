import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import path from 'path';
import { config } from './config';
import { inferImageContentType } from './utils/imageValidation';

let s3Client: S3Client | null = null;

function getR2Client(): S3Client {
  if (!s3Client) {
    if (!config.r2.bucket || !config.r2.accessKeyId || !config.r2.secretAccessKey) {
      throw new Error('R2 storage is enabled but R2_BUCKET, R2_ACCESS_KEY_ID, or R2_SECRET_ACCESS_KEY is missing');
    }
    if (!config.r2.endpoint) {
      throw new Error('R2_ENDPOINT is required when R2 credentials are set (find it in Cloudflare R2 → Overview)');
    }
    s3Client = new S3Client({
      region: config.r2.region,
      endpoint: config.r2.endpoint,
      credentials: {
        accessKeyId: config.r2.accessKeyId,
        secretAccessKey: config.r2.secretAccessKey,
      },
      forcePathStyle: true,
    });
  }
  return s3Client;
}

export function generateUploadFilename(originalName: string): string {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = path.extname(originalName) || '.jpg';
  return `invite-${uniqueSuffix}${ext}`;
}

export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string,
  originalName: string
): Promise<string> {
  const client = getR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: config.r2.bucket!,
      Key: key,
      Body: buffer,
      ContentType: inferImageContentType(contentType, originalName),
    })
  );
  return key;
}
