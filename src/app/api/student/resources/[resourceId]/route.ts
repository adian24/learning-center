import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resourceId = (await params).resourceId;

    // Validate resource ID
    if (!resourceId) {
      return new NextResponse("Resource ID is required", { status: 400 });
    }

    // Get student profile
    const studentProfile = await db.studentProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!studentProfile) {
      return new NextResponse("Student profile not found", { status: 404 });
    }

    // Get resource with related data
    const resource = await db.resource.findUnique({
      where: {
        id: resourceId,
      },
      include: {
        chapter: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                teacherId: true,
              },
            },
          },
        },
      },
    });

    if (!resource) {
      return new NextResponse("Resource not found", { status: 404 });
    }

    // Verify student has access to this resource through course enrollment
    const enrolledCourse = await db.enrolledCourse.findFirst({
      where: {
        studentId: studentProfile.id,
        courseId: resource.chapter.course.id,
        isActive: true,
      },
    });

    if (!enrolledCourse) {
      return new NextResponse("Access denied to this resource", {
        status: 403,
      });
    }

    // Return resource data
    return NextResponse.json(resource);
  } catch (error) {
    console.error("[STUDENT_RESOURCE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
