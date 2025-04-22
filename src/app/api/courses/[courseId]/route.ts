import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const courseId = (await params).courseId;
    const session = await auth();
    const userId = session?.user?.id;

    let enrollments: { courseId: string }[] = [];

    // Handle authenticated users with student profile
    if (session?.user?.id) {
      const studentProfile = await db.studentProfile.findUnique({
        where: {
          userId: session.user.id,
        },
      });

      // If user has a student profile, include progress information
      if (studentProfile) {
        enrollments = await db.enrolledCourse.findMany({
          where: {
            studentId: studentProfile.id,
            status: "COMPLETED",
          },
          select: { courseId: true },
        });

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

        const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));

        // Calculate total duration from chapters
        const totalDuration = course.chapters.reduce((total, chapter) => {
          return total + (chapter.duration || 0);
        }, 0);

        // Update course with calculated duration
        const courseWithDuration = {
          ...course,
          duration: totalDuration,
          isEnrolled: enrolledCourseIds.has(course.id),
        };

        // Check for certificate
        const certificate = await db.certificate.findUnique({
          where: {
            studentId_courseId: {
              studentId: studentProfile.id,
              courseId: courseId,
            },
          },
        });

        return NextResponse.json({
          course: courseWithDuration,
          certificate,
          studentId: studentProfile.id,
        });
      }
    }

    // For unauthenticated users or users without student profile
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
            resources: true,
            quizzes: true,
          },
        },
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Calculate total duration from chapters
    const totalDuration = course.chapters.reduce((total, chapter) => {
      return total + (chapter.duration || 0);
    }, 0);

    // Update course with calculated duration
    const courseWithDuration = {
      ...course,
      duration: totalDuration,
    };

    // Return just the course data without student info
    return NextResponse.json({ course: courseWithDuration });
  } catch (error) {
    console.error("[COURSE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
