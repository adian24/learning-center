import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/db";

type RouteParams = {
  params: Promise<{
    courseId: string;
    chapterId: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const chapterId = (await context.params).chapterId;
    const courseId = (await context.params).courseId;

    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        courseId: courseId,
      },
      include: {
        course: {
          select: {
            title: true,
            teacherId: true,
          },
        },
        quizzes: true,
        resources: true,
        userProgress: true,
      },
    });

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.error("[CHAPTER_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const chapterId = (await context.params).chapterId;
    const courseId = (await context.params).courseId;

    const body = await request.json();
    const { title, description, isFree, isPublished, position } = body;

    const chapter = await db.chapter.update({
      where: {
        id: chapterId,
        courseId: courseId,
      },
      data: {
        title,
        description,
        isFree,
        isPublished,
        position,
      },
    });

    return NextResponse.json(chapter);
  } catch (error) {
    console.error("[CHAPTER_PATCH]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const chapterId = (await context.params).chapterId;
    const courseId = (await context.params).courseId;

    await db.chapter.delete({
      where: {
        id: chapterId,
        courseId: courseId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CHAPTER_DELETE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
