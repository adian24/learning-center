import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { NextResponse } from "next/server";

// GET all resources for a teacher
export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get URL parameters
    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("chapterId");
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("perPage") || "10");

    // Calculate skip
    const skip = (page - 1) * perPage;

    // Get teacher profile
    const teacherProfile = await db.teacherProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!teacherProfile) {
      return new NextResponse("Teacher profile not found", { status: 404 });
    }

    // Build where clause
    const whereClause: any = {};
    
    if (chapterId) {
      // Verify the chapter belongs to the teacher
      const chapter = await db.chapter.findFirst({
        where: {
          id: chapterId,
          course: {
            teacherId: teacherProfile.id,
          },
        },
      });

      if (!chapter) {
        return new NextResponse("Chapter not found or unauthorized", { status: 404 });
      }

      whereClause.chapterId = chapterId;
    } else {
      // Get all resources for teacher's chapters
      whereClause.chapter = {
        course: {
          teacherId: teacherProfile.id,
        },
      };
    }

    // Get total count
    const total = await db.resource.count({
      where: whereClause,
    });

    // Get paginated resources
    const resources = await db.resource.findMany({
      where: whereClause,
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
        createdAt: "desc",
      },
      skip,
      take: perPage,
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / perPage);

    // Prepare response
    const response = {
      resources: resources ?? [],
      meta: {
        currentPage: page,
        totalPages,
        perPage,
        total,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[RESOURCES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST new resource
export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, content, summary, readTime, isPublished, chapterId } = body;

    console.log("[RESOURCES_POST] Body:", body);

    // Validate required fields
    if (!title || !content || !chapterId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get teacher profile
    const teacherProfile = await db.teacherProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!teacherProfile) {
      return new NextResponse("Teacher profile not found", { status: 404 });
    }

    // Verify the chapter belongs to the teacher
    const chapter = await db.chapter.findFirst({
      where: {
        id: chapterId,
        course: {
          teacherId: teacherProfile.id,
        },
      },
    });

    if (!chapter) {
      return new NextResponse("Chapter not found or unauthorized", { status: 404 });
    }

    // Create resource
    const resource = await db.resource.create({
      data: {
        title,
        content,
        summary,
        readTime: readTime ? parseInt(readTime) : null,
        isPublished: isPublished ?? false,
        chapterId,
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
    });

    console.log("[RESOURCES_POST] Resource created:", resource);

    return NextResponse.json(resource);
  } catch (error) {
    console.error("[RESOURCES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}