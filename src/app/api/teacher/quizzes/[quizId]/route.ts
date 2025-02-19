import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const quizId = (await params).quizId;
    const session = await auth();
    const userId = session?.user?.id;
    const { title, description, timeLimit, passingScore } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const quiz = await db.quiz.update({
      where: {
        id: quizId,
      },
      data: {
        title,
        description,
        timeLimit,
        passingScore,
      },
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("[QUIZ_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const quizId = (await params).quizId;
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const quiz = await db.quiz.delete({
      where: {
        id: quizId,
      },
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("[QUIZ_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
