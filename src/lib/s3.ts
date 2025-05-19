import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  endpoint: process.env.IDCLOUD_S3_URL,
  credentials: {
    accessKeyId: process.env.IDCLOUD_ACCESSKEY_ID || "",
    secretAccessKey: process.env.IDCLOUD_SECRETACCESS_KEY || "",
  },
  forcePathStyle: true,
});
