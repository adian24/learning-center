import { s3Client } from "@/lib/s3";
import { Upload } from "@aws-sdk/lib-storage";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const BUCKET_NAME = process.env.IDCLOUD_BUCKET_NAME;
const S3_URL = process.env.IDCLOUD_S3_URL;

export async function uploadFile(file: File, fileName: string) {
  try {
    // Convert File to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    };

    const command = new PutObjectCommand(params);

    await s3Client.send(command);

    const fileUrl = `${S3_URL}/${BUCKET_NAME}/${fileName}`;
    return fileUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

export async function uploadLargeFile(file: File, fileName: string) {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file,
      ContentType: file.type,
    };

    const multipartUpload = new Upload({
      client: s3Client,
      params,
    });

    await multipartUpload.done();

    const fileUrl = `${S3_URL}/${BUCKET_NAME}/${fileName}`;

    return fileUrl;
  } catch (error) {
    console.error("Error uploading large file:", error);
    throw error;
  }
}
