import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { BUCKET_NAME, S3_ENDPOINT, S3_THUMBNAIL, s3Client } from "@/lib/s3";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { fileType } = await req.json();

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(fileType)) {
      return new NextResponse("Invalid file format", { status: 400 });
    }

    // Generate a unique file key
    const fileExtension = fileType.split("/")[1];
    const key = `${S3_THUMBNAIL}/${uuidv4()}.${fileExtension}`;

    // Create command for putting object
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    // Generate presigned URL
    const presignedUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 300, // URL expires in 5 minutes
    });

    return NextResponse.json({
      key,
      presignedUrl,
      url: `${S3_ENDPOINT}/${BUCKET_NAME}/${key}`,
    });
  } catch (error) {
    console.error("[THUMBNAIL_PRESIGNED_UPLOAD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
