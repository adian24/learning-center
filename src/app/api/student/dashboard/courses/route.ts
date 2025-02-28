// app/api/student/dashboard/courses/route.ts
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

    // Get enrolled courses with details
    const enrolledCourses = await db.enrolledCourse.findMany({
      where: {
        studentId: studentProfile.id,
        status: "COMPLETED", // Only show paid/active courses
      },
      select: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            chapters: {
              where: {
                isPublished: true,
              },
              select: {
                id: true,
              },
            },
            teacher: {
              select: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // For each course, get progress information
    const coursesWithProgress = await Promise.all(
      enrolledCourses.map(async (enrolledCourse) => {
        const course = enrolledCourse.course;
        const chapterIds = course.chapters.map((chapter) => chapter.id);

        // Get progress for these chapters
        const progress = await db.userProgress.findMany({
          where: {
            studentId: studentProfile.id,
            chapterId: {
              in: chapterIds,
            },
          },
        });

        const completedChapters = progress.filter((p) => p.isCompleted).length;
        const totalChapters = chapterIds.length;

        // Calculate completion percentage
        const progressPercentage =
          totalChapters > 0
            ? Math.round((completedChapters / totalChapters) * 100)
            : 0;

        return {
          id: course.id,
          title: course.title,
          description: course.description,
          imageUrl: course.imageUrl,
          teacher: course.teacher.user.name,
          category: course.category?.name,
          chaptersCount: totalChapters,
          completedChapters,
          progress: progressPercentage,
        };
      })
    );

    return NextResponse.json(coursesWithProgress);
  } catch (error) {
    console.error("[STUDENT_DASHBOARD_COURSES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
