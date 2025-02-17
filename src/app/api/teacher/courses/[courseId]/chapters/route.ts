import db from "@/lib/db/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const json = await req.json();
    const { title, description, isFree = false } = json;

    if (!title || !params.courseId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const lastChapter = await db.chapter.findFirst({
      where: {
        courseId: params.courseId,
      },
      orderBy: {
        position: "desc",
      },
    });

    const newPosition = (lastChapter?.position ?? 0) + 1;

    const chapter = await db.chapter.create({
      data: {
        title,
        description,
        position: newPosition,
        isFree,
        courseId: params.courseId,
      },
    });

    return NextResponse.json(chapter);
  } catch (error) {
    console.error("[CHAPTERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = params.courseId;

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
