import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { z } from "zod";
import { updateUserProgressScore } from "@/lib/services/quiz-score-service";

const submitQuizAttemptSchema = z.object({
  quizId: z.string(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOptionId: z.string().optional(),
      textAnswer: z.string().optional(),
    })
  ),
});

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const validationResult = submitQuizAttemptSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { quizId, answers } = validationResult.data;

    // Get quiz with questions and correct answers
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

    // Get or create UserProgress for this chapter
    const userProgress = await db.userProgress.upsert({
      where: {
        studentId_chapterId: {
          studentId: studentProfile.id,
          chapterId: quiz.chapterId,
        },
      },
      update: {},
      create: {
        studentId: studentProfile.id,
        chapterId: quiz.chapterId,
        watchedSeconds: 0,
        isCompleted: false,
      },
    });

    // Create quiz attempt
    const quizAttempt = await db.quizAttempt.create({
      data: {
        quizId: quizId,
        studentId: studentProfile.id,
        userProgressId: userProgress.id,
        score: 0, // Will be calculated below
        startedAt: new Date(),
      },
    });

    // Process answers and calculate score
    let totalPoints = 0;
    let earnedPoints = 0;
    const studentAnswers = [];

    for (const answer of answers) {
      const question = quiz.questions.find((q) => q.id === answer.questionId);
      if (!question) continue;

      totalPoints += question.points;

      let isCorrect = false;
      let pointsEarned = 0;

      // Check if answer is correct based on question type
      if (
        question.type === "MULTIPLE_CHOICE" ||
        question.type === "SINGLE_CHOICE"
      ) {
        const correctOption = question.options.find((opt) => opt.isCorrect);
        if (correctOption && answer.selectedOptionId === correctOption.id) {
          isCorrect = true;
          pointsEarned = question.points;
        }
      } else if (question.type === "TRUE_FALSE") {
        const correctOption = question.options.find((opt) => opt.isCorrect);
        if (correctOption && answer.selectedOptionId === correctOption.id) {
          isCorrect = true;
          pointsEarned = question.points;
        }
      }
      // For TEXT and NUMBER types, you might need more complex logic

      earnedPoints += pointsEarned;

      // Create student answer record
      studentAnswers.push({
        questionId: answer.questionId,
        selectedOptionId: answer.selectedOptionId || null,
        textAnswer: answer.textAnswer || null,
        attemptId: quizAttempt.id,
        isCorrect,
        pointsEarned,
      });
    }

    // Create all student answers
    await db.studentAnswer.createMany({
      data: studentAnswers,
    });

    // Calculate final score percentage
    const scorePercentage =
      totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    // Update quiz attempt with final score
    const updatedQuizAttempt = await db.quizAttempt.update({
      where: { id: quizAttempt.id },
      data: {
        score: scorePercentage,
        completedAt: new Date(),
      },
      include: {
        answers: {
          include: {
            question: true,
            selectedOption: true,
          },
        },
        quiz: true,
      },
    });

    // Update chapter score based on all quiz results
    await updateUserProgressScore(studentProfile.id, quiz.chapterId);

    return NextResponse.json({
      message: "Quiz attempt submitted successfully",
      attempt: updatedQuizAttempt,
      score: scorePercentage,
      passed: scorePercentage >= quiz.passingScore,
    });
  } catch (error) {
    console.error("[QUIZ_ATTEMPT_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const quizId = searchParams.get("quizId");
    const chapterId = searchParams.get("chapterId");

    if (quizId) {
      // Get attempts for specific quiz
      const attempts = await db.quizAttempt.findMany({
        where: {
          quizId: quizId,
          studentId: studentProfile.id,
        },
        include: {
          quiz: {
            select: {
              title: true,
              passingScore: true,
            },
          },
          answers: {
            include: {
              question: {
                select: {
                  text: true,
                  explanation: true,
                },
              },
              selectedOption: {
                select: {
                  text: true,
                  isCorrect: true,
                },
              },
            },
          },
        },
        orderBy: {
          startedAt: "desc",
        },
      });

      return NextResponse.json({ attempts });
    }

    if (chapterId) {
      // Get all attempts for quizzes in a chapter
      const attempts = await db.quizAttempt.findMany({
        where: {
          studentId: studentProfile.id,
          quiz: {
            chapterId: chapterId,
          },
        },
        include: {
          quiz: {
            select: {
              id: true,
              title: true,
              passingScore: true,
            },
          },
        },
        orderBy: {
          startedAt: "desc",
        },
      });

      return NextResponse.json({ attempts });
    }

    // Get all quiz attempts for the student
    const allAttempts = await db.quizAttempt.findMany({
      where: {
        studentId: studentProfile.id,
      },
      include: {
        quiz: {
          include: {
            chapter: {
              include: {
                course: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json({ attempts: allAttempts });
  } catch (error) {
    console.error("[QUIZ_ATTEMPT_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
