import db from "@/lib/db/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { title, description, courseId, position, isFree = false } = json;

    if (!title || !courseId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const chapter = await db.chapter.create({
      data: {
        title,
        description,
        position,
        isFree,
        courseId,
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
      },
    });

    return NextResponse.json(chapters);
  } catch (error) {
    console.error("[CHAPTERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
