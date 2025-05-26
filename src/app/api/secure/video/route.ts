// src/app/api/secure-video/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { BUCKET_NAME, s3Client } from "@/lib/s3";
import db from "@/lib/db/db";

/**
 * GET: Generate a secure signed URL for a video
 * Required query params: key
 * Required query params: chapterId (for access verification)
 * Returns: { url: string, expiresIn: number }
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    const chapterId = searchParams.get("chapterId");

    if (!key) {
      return NextResponse.json(
        { error: "Missing required parameter: key" },
        { status: 400 }
      );
    }

    if (!chapterId) {
      return NextResponse.json(
        { error: "Missing required parameter: chapterId" },
        { status: 400 }
      );
    }

    // Verify the key belongs to videos folder for safety
    if (!key.startsWith("videos/")) {
      return NextResponse.json(
        { error: "Invalid video key format" },
        { status: 400 }
      );
    }

    // Get chapter with course information
    const chapter = await db.chapter.findUnique({
      where: { id: chapterId },
      include: {
        course: {
          include: {
            enrolledStudents: true,
          },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // Check access permissions
    let hasAccess = false;

    // Check if user is the teacher of the course
    const teacherProfile = await db.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (teacherProfile && chapter.course.teacherId === teacherProfile.id) {
      hasAccess = true;
    }

    // Check if chapter is free (allow access to anyone)
    if (!hasAccess && chapter.isFree) {
      hasAccess = true;
    }

    // Check if user is enrolled in the course (for paid content)
    if (!hasAccess) {
      const studentProfile = await db.studentProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (studentProfile) {
        const enrollment = chapter.course.enrolledStudents.find(
          (e) => e.studentId === studentProfile.id && e.status === "COMPLETED"
        );
        hasAccess = !!enrollment;
      }
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied to this video content" },
        { status: 403 }
      );
    }

    // Generate signed URL for video
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, getCommand, {
      expiresIn: 3600, // 1 hour for videos
    });

    // Update user progress to track video access
    if (teacherProfile?.id !== chapter.course.teacherId) {
      const studentProfile = await db.studentProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (studentProfile) {
        // Create or update progress record to track last accessed
        await db.userProgress.upsert({
          where: {
            studentId_chapterId: {
              studentId: studentProfile.id,
              chapterId: chapter.id,
            },
          },
          update: {
            lastWatchedAt: new Date(),
          },
          create: {
            studentId: studentProfile.id,
            chapterId: chapter.id,
            isCompleted: false,
            watchedSeconds: 0,
            lastWatchedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({
      url: signedUrl,
      expiresIn: 3600,
      chapterTitle: chapter.title,
      duration: chapter.duration,
    });
  } catch (error) {
    console.error("[SECURE_VIDEO_GET]", error);
    return NextResponse.json(
      { error: "Failed to generate secure video URL" },
      { status: 500 }
    );
  }
}
