// app/api/teacher/dashboard/stats/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find the teacher profile for the current user
    const teacherProfile = await db.teacherProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!teacherProfile) {
      return new NextResponse("Teacher profile not found", { status: 404 });
    }

    // Get total courses for this teacher
    const totalCourses = await db.course.count({
      where: {
        teacherId: teacherProfile.id,
      },
    });

    // Get all course IDs for this teacher
    const courses = await db.course.findMany({
      where: {
        teacherId: teacherProfile.id,
      },
      select: {
        id: true,
      },
    });

    const courseIds = courses.map((course) => course.id);

    // Get total unique students enrolled in teacher's courses
    const enrollments = await db.enrolledCourse.findMany({
      where: {
        courseId: {
          in: courseIds,
        },
        status: "COMPLETED",
      },
      select: {
        studentId: true,
      },
    });

    // Count unique students (using Set to remove duplicates)
    const uniqueStudentIds = new Set(enrollments.map((e) => e.studentId));
    const totalStudents = uniqueStudentIds.size;

    // Calculate completion rate across all courses
    const userProgress = await db.userProgress.findMany({
      where: {
        chapter: {
          courseId: {
            in: courseIds,
          },
        },
      },
    });

    const totalProgress = userProgress.length;
    const completedProgress = userProgress.filter(
      (progress) => progress.isCompleted
    ).length;

    const completionRate =
      totalProgress > 0
        ? Math.round((completedProgress / totalProgress) * 100)
        : 0;

    // Calculate total revenue from all courses
    const revenue = await db.enrolledCourse.aggregate({
      where: {
        courseId: {
          in: courseIds,
        },
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    });

    const totalRevenue = revenue._sum.amount || 0;

    return NextResponse.json({
      totalCourses,
      totalStudents,
      completionRate,
      totalRevenue,
    });
  } catch (error) {
    console.error("[TEACHER_DASHBOARD_STATS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
