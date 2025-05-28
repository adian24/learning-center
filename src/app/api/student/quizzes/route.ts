import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get student profile
    const studentProfile = await db.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("chapterId");
    const quizId = searchParams.get("quizId");

    if (quizId) {
      // Get specific quiz with questions and options
      const quiz = await db.quiz.findUnique({
        where: { id: quizId },
        include: {
          questions: {
            include: {
              options: true,
            },
          },
          chapter: {
            include: {
              course: {
                include: {
                  enrolledStudents: {
                    where: {
                      studentId: studentProfile.id,
                      status: "COMPLETED",
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!quiz) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
      }

      // Check if user has access to this quiz
      const hasAccess =
        quiz.chapter.isFree || quiz.chapter.course.enrolledStudents.length > 0;

      if (!hasAccess) {
        return NextResponse.json(
          { error: "Access denied to this quiz" },
          { status: 403 }
        );
      }

      return NextResponse.json(quiz);
    }

    if (chapterId) {
      // Get all quizzes for a chapter
      const quizzes = await db.quiz.findMany({
        where: {
          chapterId: chapterId,
        },
        include: {
          questions: {
            include: {
              options: true,
            },
          },
          chapter: {
            include: {
              course: {
                include: {
                  enrolledStudents: {
                    where: {
                      studentId: studentProfile.id,
                      status: "COMPLETED",
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Filter quizzes based on access
      const accessibleQuizzes = quizzes.filter((quiz) => {
        return (
          quiz.chapter.isFree || quiz.chapter.course.enrolledStudents.length > 0
        );
      });

      return NextResponse.json(accessibleQuizzes);
    }

    return NextResponse.json(
      { error: "Either chapterId or quizId must be provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[STUDENT_QUIZZES_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
