import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db/db";
import { auth } from "@/lib/auth";

// Input validation schema
const checkStatusSchema = z.object({
  enrollmentId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    // Get current user session
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const result = checkStatusSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.format() },
        { status: 400 }
      );
    }

    const { enrollmentId } = result.data;

    // Get enrollment
    const enrollment = await db.enrolledCourse.findUnique({
      where: { id: enrollmentId },
      include: { student: true },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Verify that the enrollment belongs to the current user
    if (enrollment.student.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Return current enrollment status without calling Midtrans
    // Status is managed by webhook or manual updates
    return NextResponse.json({
      status: enrollment.status,
      enrollmentId: enrollment.id,
      transactionStatus: enrollment.status.toLowerCase(),
    });
  } catch (error) {
    console.error("Check payment status error:", error);
    return NextResponse.json(
      { error: "Failed to check payment status" },
      { status: 500 }
    );
  }
}
