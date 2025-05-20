import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { z } from "zod";

const createEnrollmentSchema = z.object({
  courseId: z.string(),
  amount: z.number().nonnegative(),
  currency: z.string().default("IDR"),
});

// GET: Fetch all enrollments for the current user
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

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const courseId = searchParams.get("courseId") || undefined;

    // Build query filter
    const filter: any = {
      studentId: studentProfile.id,
    };

    // Add optional filters
    if (status) {
      filter.status = status;
    }

    if (courseId) {
      filter.courseId = courseId;
    }

    // Fetch enrollments with related course data
    const enrollments = await db.enrolledCourse.findMany({
      where: filter,
      include: {
        course: {
          include: {
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
              where: {
                isPublished: true,
              },
              select: {
                id: true,
                title: true,
                position: true,
                userProgress: {
                  where: {
                    studentId: studentProfile.id,
                  },
                },
              },
              orderBy: {
                position: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Process enrollments to add progress info
    const processedEnrollments = enrollments.map((enrollment) => {
      const totalChapters = enrollment.course.chapters.length;
      const completedChapters = enrollment.course.chapters.filter(
        (chapter) => chapter.userProgress?.[0]?.isCompleted
      ).length;

      const progress =
        totalChapters > 0
          ? Math.round((completedChapters / totalChapters) * 100)
          : 0;

      return {
        ...enrollment,
        progress,
        completedChapters,
        totalChapters,
      };
    });

    return NextResponse.json(processedEnrollments);
  } catch (error) {
    console.error("[ENROLLMENTS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create a new enrollment
export async function POST(req: NextRequest) {
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

    // Parse and validate request body
    const body = await req.json();
    const validationResult = createEnrollmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { courseId, amount, currency } = validationResult.data;

    // Check if course exists
    const course = await db.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if already enrolled
    const existingEnrollment = await db.enrolledCourse.findUnique({
      where: {
        studentId_courseId: {
          studentId: studentProfile.id,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      if (existingEnrollment.status === "COMPLETED") {
        return NextResponse.json(
          { error: "Already enrolled in this course" },
          { status: 400 }
        );
      }

      // Update existing enrollment if not completed
      const updatedEnrollment = await db.enrolledCourse.update({
        where: { id: existingEnrollment.id },
        data: {
          amount,
          currency,
          status: "PENDING",
          isActive: false,
        },
      });

      return NextResponse.json({
        message: "Enrollment updated",
        enrollment: updatedEnrollment,
      });
    }

    // Create new enrollment
    const newEnrollment = await db.enrolledCourse.create({
      data: {
        studentId: studentProfile.id,
        courseId,
        amount,
        currency,
        status: "PENDING",
        isActive: false,
      },
    });

    return NextResponse.json(
      {
        message: "Enrollment created",
        enrollment: newEnrollment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ENROLLMENTS_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
