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
    if (!params.courseId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const chapters = await db.chapter.findMany({
      where: {
        courseId: params.courseId,
      },
      orderBy: {
        position: "asc",
      },
      include: {
        course: {
          select: {
            title: true,
            teacherId: true,
          },
        },
        resources: true,
        quizzes: true,
      },
    });

    return NextResponse.json(chapters);
  } catch (error) {
    console.error("[CHAPTERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
