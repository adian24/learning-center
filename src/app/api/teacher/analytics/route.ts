// app/api/teacher/analytics/route.ts
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

    // Get all course IDs for this teacher
    const courses = await db.course.findMany({
      where: {
        teacherId: teacherProfile.id,
      },
      select: {
        id: true,
        title: true,
        enrolledStudents: {
          select: {
            createdAt: true,
          },
          where: {
            status: "COMPLETED",
          },
        },
      },
    });

    // Calculate enrollments per month for the last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));

    // Prepare monthly data
    const monthlyData = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();

      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const enrollmentsThisMonth = courses.flatMap((course) =>
        course.enrolledStudents.filter((enrollment) => {
          const enrollDate = new Date(enrollment.createdAt);
          return enrollDate >= monthStart && enrollDate <= monthEnd;
        })
      ).length;

      monthlyData.unshift({
        month: `${month} ${year}`,
        enrollments: enrollmentsThisMonth,
      });
    }

    // Format course data for analytics
    const courseData = courses.map((course) => ({
      name: course.title,
      students: course.enrolledStudents.length,
    }));

    return NextResponse.json({
      monthlyEnrollments: monthlyData,
      courseData,
    });
  } catch (error) {
    console.error("[TEACHER_ANALYTICS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
