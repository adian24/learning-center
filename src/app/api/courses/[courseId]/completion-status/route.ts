import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courseId = (await params).courseId;

    const studentProfile = await db.studentProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    // Get course with chapters
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          where: { isPublished: true },
          orderBy: { position: "asc" },
        },
        teacher: {
          include: {
            user: true,
            company: true,
          },
        },
        category: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check progress for all chapters
    const chapterProgress = await db.userProgress.findMany({
      where: {
        studentId: studentProfile.id,
        chapterId: {
          in: course.chapters.map((ch) => ch.id),
        },
      },
    });

    // Calculate completion
    const completedChapters = chapterProgress.filter(
      (p) => p.isCompleted && (p.chapterScore || 0) >= 65
    );

    const isCompleted =
      completedChapters.length === course.chapters.length &&
      course.chapters.length > 0;

    // Get certificate if exists
    let certificate = null;
    if (isCompleted) {
      certificate = await db.certificate.findUnique({
        where: {
          studentId_courseId: {
            studentId: studentProfile.id,
            courseId: courseId,
          },
        },
      });
    }

    return NextResponse.json({
      isCompleted,
      completionPercentage:
        course.chapters.length > 0
          ? Math.round(
              (completedChapters.length / course.chapters.length) * 100
            )
          : 0,
      completedChapters: completedChapters.length,
      totalChapters: course.chapters.length,
      completionDate: certificate?.issueDate || null,
      certificate: certificate
        ? {
            id: certificate.id,
            certificateNumber: certificate.certificateNumber,
            pdfUrl: certificate.pdfUrl,
            issueDate: certificate.issueDate,
          }
        : null,
      instructor: course.teacher.user.name,
      category: course.category?.name,
    });
  } catch (error) {
    console.error("[COURSE_COMPLETION_STATUS]", error);
    return NextResponse.json(
      { error: "Failed to check completion status" },
      { status: 500 }
    );
  }
}
