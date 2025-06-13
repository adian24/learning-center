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
      // Get specific quiz with questions, options, and attempt data
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
          // ✨ NEW: Include quiz attempts for this student
          attempts: {
            where: {
              studentId: studentProfile.id,
            },
            orderBy: {
              completedAt: "desc", // Latest attempts first
            },
            select: {
              id: true,
              score: true,
              completedAt: true,
              startedAt: true,
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

      // ✨ NEW: Calculate attempt statistics
      const attempts = quiz.attempts;
      const hasAttempted = attempts.length > 0;
      const bestScore = hasAttempted
        ? Math.max(...attempts.map((a) => a.score))
        : 0;
      const latestAttempt = attempts[0] || null;
      const totalAttempts = attempts.length;
      const averageScore = hasAttempted
        ? Math.round(
            attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
          )
        : 0;

      // ✨ NEW: Determine quiz status
      const hasPassed = bestScore >= quiz.passingScore;
      const canRetake = totalAttempts < 3; // Max 3 attempts
      const attemptsRemaining = Math.max(0, 3 - totalAttempts);

      // Return quiz with attempt data
      const quizWithAttempts = {
        ...quiz,
        // ✨ NEW: Add attempt metadata
        _attemptData: {
          hasAttempted,
          bestScore,
          averageScore,
          totalAttempts,
          hasPassed,
          canRetake,
          attemptsRemaining,
          latestAttempt: latestAttempt
            ? {
                id: latestAttempt.id,
                score: latestAttempt.score,
                completedAt: latestAttempt.completedAt,
              }
            : null,
        },
        // Don't expose attempts array to avoid data bloat
        attempts: undefined,
      };

      return NextResponse.json(quizWithAttempts);
    }

    if (chapterId) {
      // Get all quizzes for a chapter with attempt data
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
          // ✨ NEW: Include quiz attempts for this student
          attempts: {
            where: {
              studentId: studentProfile.id,
            },
            orderBy: {
              completedAt: "desc",
            },
            select: {
              id: true,
              score: true,
              completedAt: true,
              startedAt: true,
            },
          },
        },
      });

      // Filter quizzes based on access and add attempt data
      const accessibleQuizzes = quizzes
        .filter((quiz) => {
          return (
            quiz.chapter.isFree ||
            quiz.chapter.course.enrolledStudents.length > 0
          );
        })
        .map((quiz) => {
          // ✨ NEW: Calculate attempt statistics for each quiz
          const attempts = quiz.attempts;
          const hasAttempted = attempts.length > 0;
          const bestScore = hasAttempted
            ? Math.max(...attempts.map((a) => a.score))
            : 0;
          const latestAttempt = attempts[0] || null;
          const totalAttempts = attempts.length;
          const averageScore = hasAttempted
            ? Math.round(
                attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
              )
            : 0;

          // ✨ NEW: Determine quiz status
          const hasPassed = bestScore >= quiz.passingScore;
          const canRetake = totalAttempts < 3; // Max 3 attempts
          const attemptsRemaining = Math.max(0, 3 - totalAttempts);

          return {
            ...quiz,
            // ✨ NEW: Add attempt metadata
            _attemptData: {
              hasAttempted,
              bestScore,
              averageScore,
              totalAttempts,
              hasPassed,
              canRetake,
              attemptsRemaining,
              latestAttempt: latestAttempt
                ? {
                    id: latestAttempt.id,
                    score: latestAttempt.score,
                    completedAt: latestAttempt.completedAt,
                  }
                : null,
            },
            // Don't expose attempts array to avoid data bloat
            attempts: undefined,
          };
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
