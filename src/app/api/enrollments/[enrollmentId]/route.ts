import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { z } from "zod";

// Input validation schema for enrollment updates
const updateEnrollmentSchema = z.object({
  status: z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"]).optional(),
  isActive: z.boolean().optional(),
  paymentId: z.string().optional(),
});

// GET: Fetch specific enrollment by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  try {
    const { enrollmentId } = await params;
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

    // Fetch enrollment with related course data
    const enrollment = await db.enrolledCourse.findUnique({
      where: {
        id: enrollmentId,
        studentId: studentProfile.id,
      },
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
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Calculate progress
    const totalChapters = enrollment.course.chapters.length;
    const completedChapters = enrollment.course.chapters.filter(
      (chapter) => chapter.userProgress?.[0]?.isCompleted
    ).length;

    const progress =
      totalChapters > 0
        ? Math.round((completedChapters / totalChapters) * 100)
        : 0;

    const processedEnrollment = {
      ...enrollment,
      progress,
      completedChapters,
      totalChapters,
    };

    return NextResponse.json(processedEnrollment);
  } catch (error) {
    console.error("[ENROLLMENT_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Update enrollment status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  try {
    const { enrollmentId } = await params;
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

    // Check if enrollment exists and belongs to the student
    const enrollment = await db.enrolledCourse.findUnique({
      where: {
        id: enrollmentId,
        studentId: studentProfile.id,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = updateEnrollmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // Update enrollment
    const updatedEnrollment = await db.enrolledCourse.update({
      where: { id: enrollmentId },
      data: validationResult.data,
    });

    return NextResponse.json({
      message: "Enrollment updated",
      enrollment: updatedEnrollment,
    });
  } catch (error) {
    console.error("[ENROLLMENT_PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Cancel enrollment
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  try {
    const { enrollmentId } = await params;
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

    // Check if enrollment exists and belongs to the student
    const enrollment = await db.enrolledCourse.findUnique({
      where: {
        id: enrollmentId,
        studentId: studentProfile.id,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Can only cancel PENDING enrollments
    if (enrollment.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending enrollments can be canceled" },
        { status: 400 }
      );
    }

    // Update to FAILED status rather than deleting the record
    const updatedEnrollment = await db.enrolledCourse.update({
      where: { id: enrollmentId },
      data: {
        status: "FAILED",
        isActive: false,
      },
    });

    return NextResponse.json({
      message: "Enrollment canceled",
      enrollment: updatedEnrollment,
    });
  } catch (error) {
    console.error("[ENROLLMENT_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
