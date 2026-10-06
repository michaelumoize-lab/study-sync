import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "study-sync";
const R2_ENDPOINT_URL =
  process.env.R2_ENDPOINT_URL ||
  (R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : "");

/**
 * Singleton AWS S3 client configured for Cloudflare R2
 */
export const r2Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT_URL,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

/**
 * Generate a short-lived (15 min) pre-signed PUT URL for direct browser uploads.
 */
export async function generatePresignedUploadUrl(
  key: string,
  expiresInSeconds: number = 900
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(r2Client, command, {
    expiresIn: expiresInSeconds,
    unhoistableHeaders: new Set(["content-type"]),
  });
}

/**
 * Generate a pre-signed GET URL for viewing or downloading a PDF.
 * Sets inline content disposition by default to render directly in browser iframes.
 */
export async function generatePresignedDownloadUrl(
  key: string,
  expiresInSeconds: number = 3600,
  options?: { inline?: boolean; filename?: string }
): Promise<string> {
  const isInline = options?.inline !== false;
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ResponseContentType: "application/pdf",
    ResponseContentDisposition: isInline
      ? "inline"
      : `attachment; filename="${options?.filename || "document.pdf"}"`,
  });

  return await getSignedUrl(r2Client, command, {
    expiresIn: expiresInSeconds,
  });
}

/**
 * Permanently delete a file from Cloudflare R2.
 */
export async function deleteR2Object(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    await r2Client.send(command);
  } catch (err) {
    console.error(`[deleteR2Object] Failed to delete object "${key}":`, err);
  }
}

