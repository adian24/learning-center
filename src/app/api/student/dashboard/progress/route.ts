// app/api/student/dashboard/progress/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find the student profile for the current user
    const studentProfile = await db.studentProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!studentProfile) {
      return new NextResponse("Student profile not found", { status: 404 });
    }

    // Get enrolled courses
    const enrolledCourses = await db.enrolledCourse.findMany({
      where: {
        studentId: studentProfile.id,
        status: "COMPLETED", // Only count paid/active courses
      },
      select: {
        courseId: true,
      },
    });

    const courseIds = enrolledCourses.map((course) => course.courseId);

    // Get all chapters from enrolled courses
    const chapters = await db.chapter.findMany({
      where: {
        courseId: {
          in: courseIds,
        },
        isPublished: true,
      },
      select: {
        id: true,
      },
    });

    const chapterIds = chapters.map((chapter) => chapter.id);

    // Get progress for these chapters
    const progress = await db.userProgress.findMany({
      where: {
        studentId: studentProfile.id,
        chapterId: {
          in: chapterIds,
        },
      },
    });

    // Calculate stats
    const completedChapters = progress.filter((p) => p.isCompleted).length;
    const inProgressChapters = progress.filter(
      (p) => !p.isCompleted && p.watchedSeconds > 0
    ).length;

    // Calculate XP (same logic as in profile endpoint)
    // Get quiz attempts
    const quizAttempts = await db.quizAttempt.findMany({
      where: {
        studentId: studentProfile.id,
      },
      select: {
        score: true,
      },
    });

    const quizXP = quizAttempts.reduce((total, attempt) => {
      return total + Math.floor((attempt.score / 10) * 5);
    }, 0);

    // Award 10 XP for each completed chapter
    const watchXP = completedChapters * 10;

    // Total XP
    const totalPoints = quizXP + watchXP;

    return NextResponse.json({
      inProgress: inProgressChapters,
      completed: completedChapters,
      totalPoints,
    });
  } catch (error) {
    console.error("[STUDENT_DASHBOARD_PROGRESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
