import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const session = await auth();
    const courseId = (await params).courseId;
    const chapterId = (await params).chapterId;

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const studentProfile = await db.studentProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!studentProfile) {
      return new NextResponse("Student profile not found", { status: 404 });
    }

    // Check enrollment
    const enrollment = await db.enrolledCourse.findUnique({
      where: {
        studentId_courseId: {
          studentId: studentProfile.id,
          courseId: courseId,
        },
      },
    });

    if (!enrollment || !enrollment.isActive) {
      return new NextResponse("Not enrolled in this course", { status: 403 });
    }

    // Fetch the chapter with nested data
    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
      },
      include: {
        resources: true,
        userProgress: {
          where: {
            studentId: studentProfile.id,
          },
        },
        quizzes: true,
      },
    });

    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 });
    }

    // Fetch course for navigation
    const course = await db.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        chapters: {
          orderBy: {
            position: "asc",
          },
          include: {
            userProgress: {
              where: {
                studentId: studentProfile.id,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // If chapter doesn't have user progress, create it
    let userProgress = chapter.userProgress[0];

    if (!userProgress) {
      userProgress = await db.userProgress.create({
        data: {
          studentId: studentProfile.id,
          chapterId: chapter.id,
          isCompleted: false,
        },
      });
    }

    // Get next and previous chapters
    const chapterIndex = course.chapters.findIndex(
      (ch) => ch.id === chapter.id
    );
    const nextChapter = course.chapters[chapterIndex + 1] || null;
    const prevChapter = course.chapters[chapterIndex - 1] || null;

    return NextResponse.json({
      chapter,
      course,
      userProgress,
      nextChapter,
      prevChapter,
      studentId: studentProfile.id,
    });
  } catch (error) {
    console.error("[CHAPTER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
