import { s3Client } from "@/lib/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function deleteFile(fileName: string) {
  try {
    const params = {
      Bucket: process.env.IDCLOUD_BUCKET_NAME,
      Key: fileName,
    };

    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);

    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}
