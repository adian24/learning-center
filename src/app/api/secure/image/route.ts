// src/app/api/secure-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { BUCKET_NAME, s3Client } from "@/lib/s3";
import db from "@/lib/db/db";

/**
 * GET: Generate a secure signed URL for an image
 * Required query params: key
 * Optional query params: courseId (for additional access verification)
 * Returns: { url: string, expiresIn: number }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    const courseId = searchParams.get("courseId");

    console.log("[SECURE_IMAGE_GET] key:", key);

    if (!key) {
      return NextResponse.json(
        { error: "Missing required parameter: key" },
        { status: 400 }
      );
    }

    // For public thumbnails, allow access without authentication
    if (key.startsWith("course-thumbnails/")) {
      const getCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const signedUrl = await getSignedUrl(s3Client, getCommand, {
        expiresIn: 3600, // 1 hour for thumbnails
      });

      return NextResponse.json({
        url: signedUrl,
        expiresIn: 3600,
      });
    }

    // For public companies, allow access without authentication
    if (key.startsWith("companies/")) {
      const getCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const signedUrl = await getSignedUrl(s3Client, getCommand, {
        expiresIn: 3600, // 1 hour for thumbnails
      });

      return NextResponse.json({
        url: signedUrl,
        expiresIn: 3600,
      });
    }

    // For profile images, require authentication and ownership verification
    if (key.startsWith("profiles/")) {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Verify the profile image belongs to the current user
      // Profile keys should be in format: profiles/{userId}-{uuid}.{ext}
      if (!key.includes(session.user.id)) {
        return NextResponse.json(
          { error: "Access denied to this profile image" },
          { status: 403 }
        );
      }

      const getCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const signedUrl = await getSignedUrl(s3Client, getCommand, {
        expiresIn: 1800, // 30 minutes for profile images
      });

      return NextResponse.json({
        url: signedUrl,
        expiresIn: 1800,
      });
    }

    // For other images, require authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Additional verification for course-specific images
    if (courseId) {
      // Check if user has access to the course
      const studentProfile = await db.studentProfile.findUnique({
        where: { userId: session.user.id },
      });

      const teacherProfile = await db.teacherProfile.findUnique({
        where: { userId: session.user.id },
      });

      let hasAccess = false;

      // Check if user is the teacher of the course
      if (teacherProfile) {
        const course = await db.course.findFirst({
          where: {
            id: courseId,
            teacherId: teacherProfile.id,
          },
        });
        hasAccess = !!course;
      }

      // Check if user is enrolled in the course (for students)
      if (!hasAccess && studentProfile) {
        const enrollment = await db.enrolledCourse.findUnique({
          where: {
            studentId_courseId: {
              studentId: studentProfile.id,
              courseId: courseId,
            },
            status: "COMPLETED",
          },
        });
        hasAccess = !!enrollment;
      }

      if (!hasAccess) {
        return NextResponse.json(
          { error: "Access denied to this resource" },
          { status: 403 }
        );
      }
    }

    // Generate signed URL
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, getCommand, {
      expiresIn: 1800, // 30 minutes for secure content
    });

    return NextResponse.json({
      url: signedUrl,
      expiresIn: 1800,
    });
  } catch (error) {
    console.error("[SECURE_IMAGE_GET]", error);
    return NextResponse.json(
      { error: "Failed to generate secure image URL" },
      { status: 500 }
    );
  }
}
