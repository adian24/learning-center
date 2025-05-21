import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { BUCKET_NAME, S3_ENDPOINT, S3_VIDEO, s3Client } from "@/lib/s3";

/**
 * POST: Generate a presigned URL for video upload
 * Required body params: fileName, fileType
 * Response includes: key, presignedUrl, url (final location)
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { fileName, fileType } = body;

    // Validate request params
    if (!fileName || !fileType) {
      return new NextResponse(
        "Missing required parameters: fileName, fileType",
        {
          status: 400,
        }
      );
    }

    // Validate file type
    const validVideoTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime", // For .mov files
    ];

    if (!validVideoTypes.includes(fileType)) {
      return new NextResponse(
        "Invalid file format. Supported formats: MP4, WebM, OGG, MOV",
        { status: 400 }
      );
    }

    // Generate a unique file key
    const fileExtension =
      fileName.split(".").pop() || fileType.split("/")[1] || "mp4";

    const sanitizedFileName = fileName
      .replace(/\.[^/.]+$/, "") // Remove extension
      .replace(/[^a-zA-Z0-9]/g, "-") // Replace non-alphanumeric with dash
      .toLowerCase();

    const key = `${S3_VIDEO}/${sanitizedFileName}-${uuidv4()}.${fileExtension}`;

    // Create command for S3 PutObject
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      // Set appropriate cache control for videos
      CacheControl: "max-age=31536000", // 1 year
    });

    // Generate presigned URL with 30 minute expiry
    const presignedUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 1800, // 30 minutes
    });

    // Return the presigned URL and file details
    return NextResponse.json({
      success: true,
      presignedUrl,
      url: `${S3_ENDPOINT}/${BUCKET_NAME}/${key}`,
    });
  } catch (error) {
    console.error("[VIDEO_UPLOAD_PRESIGNED]", error);
    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
}

/**
 * DELETE: Remove a video from S3 storage
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

    // Verify the key belongs to videos folder for safety
    if (!key.startsWith(S3_VIDEO + "/")) {
      return new NextResponse(
        "Invalid file key. Only video files can be deleted with this endpoint",
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
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.error("[VIDEO_DELETE]", error);
    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
}
