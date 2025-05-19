import { s3Client } from "@/lib/s3";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function listFiles(prefix = "") {
  try {
    const params = {
      Bucket: process.env.IDCLOUD_BUCKET_NAME,
      Prefix: prefix,
    };

    const command = new ListObjectsV2Command(params);
    const response = await s3Client.send(command);

    return response.Contents;
  } catch (error) {
    console.error("Error listing files:", error);
    throw error;
  }
}
