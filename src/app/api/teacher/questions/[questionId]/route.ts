import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const questionId = (await params).questionId;

    const question = await db.question.findUnique({
      where: {
        id: questionId,
      },
      include: {
        options: true,
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error("[QUESTION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const questionId = (await params).questionId;
    const session = await auth();
    const userId = session?.user?.id;
    const { text, type, points, explanation } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const question = await db.question.update({
      where: {
        id: questionId,
      },
      data: {
        text,
        type,
        points,
        explanation,
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error("[QUESTION_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const questionId = (await params).questionId;
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const question = await db.question.delete({
      where: {
        id: questionId,
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error("[QUESTION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
