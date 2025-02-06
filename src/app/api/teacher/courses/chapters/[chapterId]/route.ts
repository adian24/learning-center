import db from "@/lib/db/db";
import { NextResponse } from "next/server";

// Get single chapter
export async function GET(
  req: Request,
  { params }: { params: { chapterId: string } }
) {
  try {
    const chapter = await db.chapter.findUnique({
      where: {
        id: params.chapterId,
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

    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.error("[CHAPTER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Update chapter
export async function PATCH(
  req: Request,
  { params }: { params: { chapterId: string } }
) {
  try {
    const { title, description, isFree, isPublished, position } =
      await req.json();

    const chapter = await db.chapter.update({
      where: {
        id: params.chapterId,
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
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Delete chapter
export async function DELETE(
  req: Request,
  { params }: { params: { chapterId: string } }
) {
  try {
    await db.chapter.delete({
      where: {
        id: params.chapterId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CHAPTER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
