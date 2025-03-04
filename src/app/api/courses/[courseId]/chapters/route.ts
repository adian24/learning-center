import db from "@/lib/db/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const courseId = (await params).courseId;

    if (!courseId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalChapters = await db.chapter.count({
      where: {
        courseId,
        title: {
          mode: "insensitive",
        },
      },
    });

    // Get paginated chapters
    const chapters = await db.chapter.findMany({
      where: {
        courseId,
        title: {
          mode: "insensitive",
        },
      },
      orderBy: {
        position: "asc",
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            teacherId: true,
          },
        },
        resources: true,
        quizzes: true,
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      chapters,
      metadata: {
        totalChapters,
        currentPage: page,
        totalPages: Math.ceil(totalChapters / limit),
        hasNextPage: skip + chapters.length < totalChapters,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("[CHAPTERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
