import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

export async function GET() {
  try {
    const session = await auth();

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

    const enrolledCourses = await db.enrolledCourse.findMany({
      where: {
        studentId: studentProfile.id,
        isActive: true,
      },
      include: {
        course: {
          include: {
            category: true,
            teacher: {
              include: {
                user: {
                  select: {
                    name: true,
                    image: true,
                  },
                },
              },
            },
            chapters: {
              include: {
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(enrolledCourses);
  } catch (error) {
    console.error("[ENROLLED_COURSES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
