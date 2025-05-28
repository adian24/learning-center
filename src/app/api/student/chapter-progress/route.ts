import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import {
  getChapterProgressWithQuizzes,
  canProceedToNextChapter,
  calculateChapterScore,
} from "@/lib/services/quiz-score-service";

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
    const courseId = searchParams.get("courseId");
    const action = searchParams.get("action"); // Can be "can-proceed"

    if (chapterId && action === "can-proceed") {
      // Check if student can proceed to next chapter
      const canProceed = await canProceedToNextChapter(
        studentProfile.id,
        chapterId
      );

      return NextResponse.json({
        canProceed,
        chapterId,
        message: canProceed
          ? "Student can proceed to next chapter"
          : "Student must complete quizzes with score >= 65 to proceed",
      });
    }

    if (chapterId) {
      // Get detailed progress for specific chapter including quiz performance
      const progress = await getChapterProgressWithQuizzes(
        studentProfile.id,
        chapterId
      );

      if (!progress) {
        // Chapter not found or no progress yet, calculate anyway
        const calculation = await calculateChapterScore(
          studentProfile.id,
          chapterId
        );

        return NextResponse.json({
          progress: null,
          calculation,
          hasProgress: false,
        });
      }

      return NextResponse.json({
        progress,
        hasProgress: true,
      });
    }

    if (courseId) {
      // Get progress for all chapters in a course with scores
      const chapters = await db.chapter.findMany({
        where: {
          courseId: courseId,
        },
        include: {
          userProgress: {
            where: {
              studentId: studentProfile.id,
            },
          },
          quizzes: {
            include: {
              attempts: {
                where: {
                  studentId: studentProfile.id,
                },
                orderBy: {
                  startedAt: "desc",
                },
                take: 1, // Get latest attempt for each quiz
              },
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      });

      // Calculate progress for each chapter
      const progressData = await Promise.all(
        chapters.map(async (chapter) => {
          const calculation = await calculateChapterScore(
            studentProfile.id,
            chapter.id
          );
          const userProgress = chapter.userProgress[0] || null;

          return {
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            position: chapter.position,
            userProgress,
            calculation,
            quizzes: chapter.quizzes.map((quiz) => ({
              id: quiz.id,
              title: quiz.title,
              passingScore: quiz.passingScore,
              latestAttempt: quiz.attempts[0] || null,
              isPassed:
                quiz.attempts.length > 0 &&
                quiz.attempts[0].score >= quiz.passingScore,
            })),
          };
        })
      );

      return NextResponse.json({
        courseProgress: progressData,
        courseId,
      });
    }

    return NextResponse.json(
      { error: "Either chapterId or courseId must be provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[CHAPTER_PROGRESS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
