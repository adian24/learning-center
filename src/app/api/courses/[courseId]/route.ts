import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const courseId = (await params).courseId;

    const course = await db.course.findUnique({
      where: {
        id: courseId,
        isPublished: true,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            company: {
              select: {
                id: true,
                name: true,
                description: true,
                logoUrl: true,
                location: true,
                website: true,
                industry: true,
                isVerified: true,
              },
            },
          },
        },
        category: true,
        chapters: {
          where: {
            isPublished: true,
          },
          include: {
            resources: {
              select: {
                id: true,
                title: true,
                summary: true,
                readTime: true,
              },
            },
            quizzes: {
              select: {
                id: true,
                title: true,
                description: true,
              },
            },
            ...(userId && {
              userProgress: {
                where: {
                  student: {
                    userId: userId,
                  },
                },
                select: {
                  id: true,
                  isCompleted: true,
                  watchedSeconds: true,
                  lastWatchedAt: true,
                },
              },
            }),
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check for certificate if user is enrolled
    let certificate = null;
    let studentId = null;
    let isEnrolled = false;

    if (userId) {
      const studentProfile = await db.studentProfile.findUnique({
        where: { userId },
      });

      if (studentProfile) {
        studentId = studentProfile.id;

        // Check if user is enrolled in this course
        const enrollment = await db.enrolledCourse.findFirst({
          where: {
            studentId: studentProfile.id,
            courseId: course.id,
          },
        });

        isEnrolled = !!enrollment;

        certificate = await db.certificate.findFirst({
          where: {
            studentId: studentProfile.id,
            courseId: course.id,
          },
          select: {
            id: true,
            certificateNumber: true,
            pdfUrl: true,
            issueDate: true,
          },
        });
      }
    }

    return NextResponse.json({
      course: {
        ...course,
        isEnrolled,
      },
      certificate,
      studentId,
    });
  } catch (error) {
    console.error("[COURSE_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}
