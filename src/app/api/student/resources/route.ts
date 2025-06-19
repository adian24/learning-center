import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("chapterId");
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("perPage") || "10");

    // Validate required parameters
    if (!chapterId) {
      return new NextResponse("Chapter ID is required", { status: 400 });
    }

    // Validate pagination parameters
    if (page < 1 || perPage < 1 || perPage > 100) {
      return new NextResponse("Invalid pagination parameters", { status: 400 });
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

    // Verify student has access to the chapter (through course enrollment)
    const enrolledCourse = await db.enrolledCourse.findFirst({
      where: {
        studentId: studentProfile.id,
        course: {
          chapters: {
            some: {
              id: chapterId,
            },
          },
        },
        isActive: true,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!enrolledCourse) {
      return new NextResponse("Access denied to this chapter", { status: 403 });
    }

    // Calculate offset for pagination
    const offset = (page - 1) * perPage;

    // Get total count of resources for this chapter
    const total = await db.resource.count({
      where: {
        chapterId: chapterId,
      },
    });

    // Get resources with pagination
    const resources = await db.resource.findMany({
      where: {
        chapterId: chapterId,
      },
      include: {
        chapter: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc", // Order by creation date, oldest first
      },
      skip: offset,
      take: perPage,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / perPage);

    const response = {
      resources: resources || [],
      meta: {
        currentPage: page,
        totalPages,
        perPage,
        total,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[STUDENT_RESOURCES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
