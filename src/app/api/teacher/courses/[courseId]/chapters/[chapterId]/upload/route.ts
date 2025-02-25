import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import db from "@/lib/db/db";
import { auth } from "@/lib/auth";

// Helper function to extract public ID from Cloudinary URL
function extractPublicIdFromUrl(url: string): string {
  try {
    // Format: https://res.cloudinary.com/cloud_name/video/upload/v1234567/path/to/file.mp4
    const regex = /\/v\d+\/(.+)\.\w+$/;
    const match = url.match(regex);

    if (match && match[1]) {
      return match[1];
    }

    throw new Error("Could not extract public ID from URL");
  } catch (error) {
    console.error("Error extracting public ID:", error);
    throw error;
  }
}

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

type RouteParams = {
  params: Promise<{
    courseId: string;
    chapterId: string;
  }>;
};

export async function POST(req: Request, context: RouteParams) {
  try {
    const chapterId = (await context.params).chapterId;
    const courseId = (await context.params).courseId;

    // Get the video file from the request
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file pmrovided" }, { status: 400 });
    }

    // Convert File to Buffer for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const response = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "video",
            folder: `courses/${courseId}/chapters/${chapterId}`,
            allowed_formats: ["mp4", "mov", "avi", "webm"],
            chunk_size: 20000000, // 20MB chunks
          },
          (error, result) => {
            if (error) reject(error);
            resolve(result);
          }
        )
        .end(buffer);
    });

    if (
      !response ||
      typeof response !== "object" ||
      !("secure_url" in response)
    ) {
      throw new Error("Invalid response from Cloudinary");
    }

    // Update chapter in database with new video URL
    await db.chapter.update({
      where: {
        id: chapterId,
        courseId: courseId,
      },
      data: {
        videoUrl: response.secure_url as string,
      },
    });

    return NextResponse.json({
      success: true,
      url: response.secure_url,
    });
  } catch (error) {
    console.error("[UPLOAD_VIDEO]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, context: RouteParams) {
  try {
    const chapterId = (await context.params).chapterId;
    const courseId = (await context.params).courseId;

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the chapter to find the video URL
    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        courseId: courseId,
      },
      include: {
        course: {
          select: {
            teacher: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // Check if user is the teacher of this course
    const isTeacher = chapter.course.teacher.userId === session.user.id;

    if (!isTeacher) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If there's no video, we don't need to delete anything
    if (!chapter.videoUrl) {
      return NextResponse.json({ message: "No video to delete" });
    }

    let deletionSuccess = false;

    // Extract the public ID from the Cloudinary URL
    // URL format: https://res.cloudinary.com/[cloud_name]/video/upload/v[version]/[public_id].[extension]
    // https://res.cloudinary.com/du9uwxyik/video/upload/v1740458507/courses/f9d1a846-e365-4000-9ac7-3546da96ef33/chapters/7ff84eb9-536b-48cc-b7c4-03354065f9a1/a1uw6x3lq3tozfunonmn.mp4
    try {
      // Extract public ID from URL
      const publicId = extractPublicIdFromUrl(chapter.videoUrl);
      console.log("Extracted public ID:", publicId);

      // Delete the video from Cloudinary
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "video",
      });

      console.log("Cloudinary deletion result:", result);
      deletionSuccess = result === "ok" || result.result === "ok";
    } catch (cloudinaryError) {
      console.error("Error deleting from Cloudinary:", cloudinaryError);
      // Continue with database update even if Cloudinary fails
    }

    // Update the chapter in the database
    await db.chapter.update({
      where: {
        id: chapterId,
      },
      data: {
        videoUrl: null,
      },
    });

    return NextResponse.json({
      message: `Video removed from database${
        deletionSuccess
          ? " and deleted from Cloudinary"
          : " (but Cloudinary deletion may have failed)"
      }`,
    });
  } catch (error) {
    console.error("[DELETE_VIDEO]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
