import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Cloudflare R2 client configuration
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export const R2_BUCKET = process.env.R2_BUCKET_NAME || '';
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

/**
 * Upload file to R2
 */
export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await r2Client.send(command);

  // Return public URL (if bucket has public access) or construct URL
  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Delete file from R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });

  await r2Client.send(command);
}

/**
 * List files in R2 bucket
 */
export async function listR2Files(prefix?: string) {
  const command = new ListObjectsV2Command({
    Bucket: R2_BUCKET,
    Prefix: prefix,
  });

  const response = await r2Client.send(command);
  return response.Contents || [];
}

/**
 * Generate presigned URL for file download (valid for 1 hour)
 */
export async function getR2PresignedUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });

  return await getSignedUrl(r2Client, command, { expiresIn: 3600 });
}
