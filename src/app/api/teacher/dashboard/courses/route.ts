// app/api/teacher/dashboard/courses/route.ts
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

    // Get courses with enrollment counts
    const courses = await db.course.findMany({
      where: {
        teacherId: teacherProfile.id,
      },
      select: {
        id: true,
        title: true,
        isPublished: true,
        enrolledStudents: {
          where: {
            status: "COMPLETED",
          },
        },
        _count: {
          select: {
            enrolledStudents: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the response
    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      studentsEnrolled: course._count.enrolledStudents,
      status: course.isPublished ? "Published" : "Draft",
    }));

    return NextResponse.json(formattedCourses);
  } catch (error) {
    console.error("[TEACHER_DASHBOARD_COURSES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
