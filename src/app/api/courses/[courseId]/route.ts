import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    const courseId = (await params).courseId;

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

    // Fetch the course with teacher and category
    const course = await db.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        teacher: {
          select: {
            bio: true,
            expertise: true,
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
        category: true,
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
            resources: true,
            quizzes: true,
          },
        },
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Check if there's a certificate
    const certificate = await db.certificate.findUnique({
      where: {
        studentId_courseId: {
          studentId: studentProfile.id,
          courseId: courseId,
        },
      },
    });

    return NextResponse.json({
      course,
      certificate,
      studentId: studentProfile.id,
    });
  } catch (error) {
    console.error("[COURSE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
