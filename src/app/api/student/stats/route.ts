import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

/**
 * API endpoint to fetch student statistics for dashboard and My Courses page
 * Returns:
 * - Total courses count
 * - In progress courses count
 * - Completed courses count
 * - Course progress details
 * - Recent activity
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get student profile
    const studentProfile = await db.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    // Get all enrollments with course and progress data
    const enrollments = await db.enrolledCourse.findMany({
      where: {
        studentId: studentProfile.id,
        status: "COMPLETED", // Only include active enrollments
      },
      include: {
        course: {
          include: {
            chapters: {
              where: {
                isPublished: true,
              },
              select: {
                id: true,
                userProgress: {
                  where: {
                    studentId: studentProfile.id,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Calculate stats
    const totalCourses = enrollments.length;
    let inProgressCount = 0;
    let completedCount = 0;

    // Process each enrollment to calculate progress
    const coursesProgress = enrollments.map((enrollment) => {
      const totalChapters = enrollment.course.chapters.length;
      const completedChapters = enrollment.course.chapters.filter(
        (chapter) => chapter.userProgress?.[0]?.isCompleted
      ).length;

      // Calculate progress percentage
      const progress =
        totalChapters > 0
          ? Math.round((completedChapters / totalChapters) * 100)
          : 0;

      // Count based on progress
      if (progress === 100) {
        completedCount++;
      } else if (progress > 0) {
        inProgressCount++;
      }

      return {
        id: enrollment.id,
        courseId: enrollment.courseId,
        title: enrollment.course.title,
        imageUrl: enrollment.course.imageUrl,
        progress,
        completedChapters,
        totalChapters,
        updatedAt: enrollment.updatedAt,
      };
    });

    // Get pending enrollments count
    const pendingEnrollments = await db.enrolledCourse.count({
      where: {
        studentId: studentProfile.id,
        status: "PENDING",
      },
    });

    // Get failed enrollments count
    const failedEnrollments = await db.enrolledCourse.count({
      where: {
        studentId: studentProfile.id,
        status: "FAILED",
      },
    });

    // Get recent activity (last 5 progress updates)
    const recentActivity = await db.userProgress.findMany({
      where: {
        studentId: studentProfile.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
      include: {
        chapter: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      totalCourses: totalCourses + pendingEnrollments + failedEnrollments,
      inProgressCount,
      completedCount,
      pendingEnrollments,
      failedEnrollments,
      coursesProgress, // Include the processed enrollments data
      recentActivity: recentActivity.map((activity) => ({
        id: activity.id,
        courseId: activity.chapter.course.id,
        courseTitle: activity.chapter.course.title,
        courseImage: activity.chapter.course.imageUrl,
        chapterId: activity.chapterId,
        chapterTitle: activity.chapter.title,
        isCompleted: activity.isCompleted,
        updatedAt: activity.updatedAt,
      })),
    });
  } catch (error) {
    console.error("[STUDENT_STATS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
