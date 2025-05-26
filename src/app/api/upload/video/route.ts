// src/app/api/upload/video/route.ts (Updated)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { BUCKET_NAME, S3_VIDEO, s3Client } from "@/lib/s3";
import db from "@/lib/db/db";

/**
 * POST: Generate a presigned URL for video upload
 * Required body params: fileName, fileType
 * Response includes: key, presignedUrl (no url field since we store keys)
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { fileName, fileType } = await req.json();

    // Validate required parameters
    if (!fileName || !fileType) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    // Validate file type
    const validTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/avi",
      "video/mov",
      "video/wmv",
      "video/flv",
      "video/mkv",
    ];
    if (!validTypes.includes(fileType)) {
      return new NextResponse("Invalid video format", { status: 400 });
    }

    // Verify user is a teacher
    const teacherProfile = await db.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherProfile) {
      return new NextResponse("Teacher profile not found", { status: 404 });
    }

    // Generate a unique file key
    const fileExtension = fileName.split(".").pop() || "mp4";
    const key = `${S3_VIDEO}/${uuidv4()}.${fileExtension}`;

    // Create command for putting object
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      // Set appropriate metadata for videos
      Metadata: {
        uploadedBy: teacherProfile.id,
        originalFileName: fileName,
      },
    });

    // Generate presigned URL
    const presignedUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 900, // URL expires in 15 minutes (longer for large video files)
    });

    return NextResponse.json({
      key, // Return only the key, not the full URL
      presignedUrl,
    });
  } catch (error) {
    console.error("[VIDEO_PRESIGNED_UPLOAD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

/**
 * DELETE: Remove a video from S3 storage
 * Required query params: key
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

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
        { status: 400 }
      );
    }

    // Verify user is a teacher
    const teacherProfile = await db.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherProfile) {
      return new NextResponse("Teacher profile not found", { status: 404 });
    }

    // Delete the video from S3
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(deleteCommand);
    } catch (s3Error) {
      console.warn("[VIDEO_DELETE_S3_WARNING]", s3Error);
    }

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.error("[VIDEO_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
