import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { BUCKET_NAME, s3Client, S3_PROFILES } from "@/lib/s3";

/**
 * POST: Generate a presigned URL for profile image upload
 * Required body params: fileType
 * Response includes: key, presignedUrl
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { fileType } = await req.json();

    // Validate required parameters
    if (!fileType) {
      return new NextResponse("Missing required parameter: fileType", {
        status: 400,
      });
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(fileType)) {
      return new NextResponse("Invalid file format", { status: 400 });
    }

    // Generate a unique file key for profile
    const fileExtension = fileType.split("/")[1];
    const key = `${S3_PROFILES}/${
      session.user.id
    }-${uuidv4()}.${fileExtension}`;

    // Create command for putting object
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      // Set appropriate cache control for profile images
      CacheControl: "max-age=31536000", // 1 year
      Metadata: {
        userId: session.user.id,
        uploadType: "profile",
      },
    });

    // Generate presigned URL
    const presignedUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 300, // URL expires in 5 minutes
    });

    return NextResponse.json({
      key,
      presignedUrl,
    });
  } catch (error) {
    console.error("[PROFILE_PRESIGNED_UPLOAD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

/**
 * DELETE: Remove a profile image from S3 storage
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

    // Verify the key belongs to profiles folder for safety
    if (!key.startsWith(S3_PROFILES + "/")) {
      return new NextResponse(
        "Invalid file key. Only profile images can be deleted with this endpoint",
        { status: 400 }
      );
    }

    // Verify the key belongs to the current user (security check)
    if (!key.includes(session.user.id)) {
      return new NextResponse("Access denied to this profile image", {
        status: 403,
      });
    }

    // Delete the image from S3
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(deleteCommand);
    } catch (s3Error) {
      // Log the error but don't fail the request if file doesn't exist
      console.warn("[PROFILE_DELETE_S3_WARNING]", s3Error);
    }

    return NextResponse.json({
      success: true,
      message: "Profile image deleted successfully",
    });
  } catch (error) {
    console.error("[PROFILE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
