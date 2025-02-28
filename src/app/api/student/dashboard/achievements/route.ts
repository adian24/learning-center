// app/api/student/dashboard/achievements/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

// Define the achievements
const ACHIEVEMENTS = [
  {
    id: "watch-chapter",
    title: "Dapatkan 10 XP dari menonton 1 Chapter",
    xp: 10,
    condition: (data: any) => data.completedChapters > 0,
  },
  {
    id: "complete-quiz",
    title: "Dapatkan 50 XP dari mengerjakan Quiz",
    xp: 50,
    condition: (data: any) => data.completedQuizzes > 0,
  },
  {
    id: "complete-course",
    title: "Dapatkan 100 XP dari menyelesaikan Course",
    xp: 100,
    condition: (data: any) => data.completedCourses > 0,
  },
];

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

    // Get student stats to check achievement conditions
    // 1. Count completed chapters
    const progress = await db.userProgress.findMany({
      where: {
        studentId: studentProfile.id,
        isCompleted: true,
      },
    });
    const completedChapters = progress.length;

    // 2. Count completed quizzes
    const quizAttempts = await db.quizAttempt.findMany({
      where: {
        studentId: studentProfile.id,
        completedAt: {
          not: null,
        },
      },
    });
    const completedQuizzes = quizAttempts.length;

    // 3. Check for completed courses
    // Get all enrolled courses
    const enrolledCourses = await db.enrolledCourse.findMany({
      where: {
        studentId: studentProfile.id,
        status: "COMPLETED", // Only count paid/active courses
      },
      select: {
        courseId: true,
      },
    });

    // For each course, check if all published chapters are completed
    let completedCourses = 0;

    await Promise.all(
      enrolledCourses.map(async (enrolledCourse) => {
        // Get all published chapters for this course
        const chapters = await db.chapter.findMany({
          where: {
            courseId: enrolledCourse.courseId,
            isPublished: true,
          },
          select: {
            id: true,
          },
        });

        const chapterIds = chapters.map((chapter) => chapter.id);

        // Get progress for these chapters
        const chapterProgress = await db.userProgress.findMany({
          where: {
            studentId: studentProfile.id,
            chapterId: {
              in: chapterIds,
            },
          },
        });

        // Check if all chapters are completed
        const allCompleted =
          chapterIds.length > 0 &&
          chapterProgress.filter((p) => p.isCompleted).length ===
            chapterIds.length;

        if (allCompleted) {
          completedCourses += 1;
        }
      })
    );

    // Filter achievements based on student's progress
    const studentData = {
      completedChapters,
      completedQuizzes,
      completedCourses,
    };

    const unlockedAchievements = ACHIEVEMENTS.filter((achievement) =>
      achievement.condition(studentData)
    );

    return NextResponse.json(unlockedAchievements);
  } catch (error) {
    console.error("[STUDENT_DASHBOARD_ACHIEVEMENTS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
