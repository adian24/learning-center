import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { BUCKET_NAME, S3_ENDPOINT, S3_THUMBNAIL, s3Client } from "@/lib/s3";

/**
 * POST: Generate a presigned URL for thumbnail upload
 * Required body params: fileType
 * Response includes: key, presignedUrl, url (final location)
 */
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
      // Set appropriate cache control for images
      CacheControl: "max-age=31536000", // 1 year
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

/**
 * DELETE: Remove a thumbnail from S3 storage
 * Required query param: key
 */
export async function DELETE(req: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get file key from URL params
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return new NextResponse("Missing required parameter: key", {
        status: 400,
      });
    }

    // Verify the key belongs to thumbnails folder for safety
    if (!key.startsWith(S3_THUMBNAIL + "/")) {
      return new NextResponse(
        "Invalid file key. Only thumbnail files can be deleted with this endpoint",
        {
          status: 400,
        }
      );
    }

    // Delete the object from S3
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(deleteCommand);

    return NextResponse.json({
      success: true,
      message: "Thumbnail deleted successfully",
    });
  } catch (error) {
    console.error("[THUMBNAIL_DELETE]", error);
    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
}
