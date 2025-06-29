import { S3Client } from "@aws-sdk/client-s3";

export const BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
export const S3_ENDPOINT = process.env.NEXT_PUBLIC_S3_ENDPOINT;
export const S3_THUMBNAIL = process.env.NEXT_PUBLIC_S3_THUMBNAIL;
export const S3_VIDEO = process.env.NEXT_PUBLIC_S3_VIDEO;
export const S3_COMPANIES = process.env.NEXT_PUBLIC_S3_COMPANIES;
export const S3_PROFILES = process.env.NEXT_PUBLIC_S3_PROFILES;

export const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_S3_REGION,
  endpoint: S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true,
});
