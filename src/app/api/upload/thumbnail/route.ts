import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { BUCKET_NAME, S3_ENDPOINT, S3_THUMBNAIL, s3Client } from "@/lib/s3";
import db from "@/lib/db/db";

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

    const { fileType, courseId } = await req.json();

    // Validate required parameters
    if (!fileType || !courseId) {
      return new NextResponse(
        "Missing required parameters: fileType, courseId",
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(fileType)) {
      return new NextResponse("Invalid file format", { status: 400 });
    }

    // Verify user owns the course
    const teacherProfile = await db.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherProfile) {
      return new NextResponse("Teacher profile not found", { status: 404 });
    }

    const course = await db.course.findFirst({
      where: {
        id: courseId,
        teacherId: teacherProfile.id,
      },
    });

    if (!course) {
      return new NextResponse("Course not found or access denied", {
        status: 404,
      });
    }

    // Generate a unique file key
    const fileExtension = fileType.split("/")[1];
    const key = `${S3_THUMBNAIL}/${uuidv4()}.${fileExtension}`;
    const finalUrl = `${S3_ENDPOINT}/${BUCKET_NAME}/${key}`;

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

    // Update course with new image URL
    await db.course.update({
      where: { id: courseId },
      data: { imageUrl: finalUrl },
    });

    return NextResponse.json({
      key,
      presignedUrl,
      url: finalUrl,
    });
  } catch (error) {
    console.error("[THUMBNAIL_PRESIGNED_UPLOAD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

/**
 * DELETE: Remove a thumbnail from S3 storage and update course
 * Required query params: key, courseId
 */
export async function DELETE(req: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get parameters from URL
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    const courseId = searchParams.get("courseId");

    if (!key || !courseId) {
      return new NextResponse("Missing required parameters: key, courseId", {
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

    // Verify user owns the course
    const teacherProfile = await db.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherProfile) {
      return new NextResponse("Teacher profile not found", { status: 404 });
    }

    const course = await db.course.findFirst({
      where: {
        id: courseId,
        teacherId: teacherProfile.id,
      },
    });

    if (!course) {
      return new NextResponse("Course not found or access denied", {
        status: 404,
      });
    }

    // Delete the old thumbnail from S3 if it exists
    if (course.imageUrl) {
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        });

        await s3Client.send(deleteCommand);
      } catch (s3Error) {
        // Log the error but don't fail the request if file doesn't exist
        console.warn("[THUMBNAIL_DELETE_S3_WARNING]", s3Error);
      }
    }

    // Update course to remove image URL
    await db.course.update({
      where: { id: courseId },
      data: { imageUrl: null },
    });

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
