import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { z } from "zod";
import {
  updateUserProgressScore,
  calculateChapterScore,
  checkAndHandleCourseCompletion,
} from "@/lib/services/quiz-score-service";

const updateProgressSchema = z.object({
  chapterId: z.string(),
  watchedSeconds: z.number().optional(),
  isCompleted: z.boolean().optional(),
  notes: z.string().optional(),
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
    const validationResult = updateProgressSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { chapterId, watchedSeconds, isCompleted, notes } =
      validationResult.data;

    // Verify chapter exists and user has access
    const chapter = await db.chapter.findUnique({
      where: { id: chapterId },
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
    });

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // Check if user has access to this chapter
    const hasAccess =
      chapter.isFree || chapter.course.enrolledStudents.length > 0;

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied to this chapter" },
        { status: 403 }
      );
    }

    // Calculate current chapter score based on quizzes
    const calculation = await calculateChapterScore(
      studentProfile.id,
      chapterId
    );

    // Prepare update data
    const updateData: any = {
      lastWatchedAt: new Date(),
    };

    if (watchedSeconds !== undefined) {
      updateData.watchedSeconds = watchedSeconds;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Set chapter score and completion status based on quiz performance
    updateData.chapterScore = calculation.chapterScore;

    // Debug logging
    console.log("Progress update - Calculation result:", calculation);
    console.log("Progress update - isCompleted param:", isCompleted);

    // Only mark as completed if:
    // 1. User explicitly sets isCompleted to true, AND
    // 2. Chapter score is >= 65 (or no quizzes exist - calculation.isCompleted handles this)
    if (isCompleted !== undefined) {
      if (isCompleted && calculation.isCompleted) {
        updateData.isCompleted = true;
        updateData.completedAt = new Date();
        console.log("Setting chapter as completed");
      } else if (isCompleted && !calculation.isCompleted) {
        // User wants to complete but doesn't meet quiz requirements
        console.log("Blocking completion - insufficient score");
        return NextResponse.json(
          {
            error: "Cannot complete chapter",
            message: `Chapter score is ${calculation.chapterScore}%. Minimum required: 65%`,
            chapterScore: calculation.chapterScore,
            requiredScore: 65,
            totalQuizzes: calculation.totalQuizzes,
            passedQuizzes: calculation.passedQuizzes,
          },
          { status: 400 }
        );
      } else {
        updateData.isCompleted = false;
        updateData.completedAt = null;
        console.log("Setting chapter as not completed");
      }
    } else {
      // If isCompleted is not provided, use the calculated value
      updateData.isCompleted = calculation.isCompleted;
      if (calculation.isCompleted) {
        updateData.completedAt = new Date();
      }
      console.log(
        "Using calculated completion status:",
        calculation.isCompleted
      );
    }

    // Update or create progress record
    const progress = await db.userProgress.upsert({
      where: {
        studentId_chapterId: {
          studentId: studentProfile.id,
          chapterId: chapterId,
        },
      },
      update: updateData,
      create: {
        studentId: studentProfile.id,
        chapterId: chapterId,
        ...updateData,
        watchedSeconds: watchedSeconds || 0,
        isCompleted: updateData.isCompleted || false,
        chapterScore: calculation.chapterScore,
      },
    });

    // If chapter is completed, unlock next chapter
    if (progress.isCompleted && Number(progress?.chapterScore) >= 65) {
      const nextChapter = await db.chapter.findFirst({
        where: {
          courseId: chapter.courseId,
          position: chapter.position + 1,
        },
      });

      if (nextChapter) {
        // Check if next chapter should be unlocked
        await db.userProgress.upsert({
          where: {
            studentId_chapterId: {
              studentId: studentProfile.id,
              chapterId: nextChapter.id,
            },
          },
          update: {
            // Don't change existing progress, just ensure it exists
          },
          create: {
            studentId: studentProfile.id,
            chapterId: nextChapter.id,
            watchedSeconds: 0,
            isCompleted: false,
            chapterScore: 0,
          },
        });
      } else {
        // This is the last chapter - check if course is completed
        await checkAndHandleCourseCompletion(
          studentProfile.id,
          chapter.courseId
        );
      }
    }

    return NextResponse.json({
      message: "Progress updated successfully",
      progress,
      chapterScore: calculation.chapterScore,
      quizSummary: {
        totalQuizzes: calculation.totalQuizzes,
        passedQuizzes: calculation.passedQuizzes,
        isCompleted: calculation.isCompleted,
      },
    });
  } catch (error) {
    console.error("[PROGRESS_UPDATE]", error);
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
    const chapterId = searchParams.get("chapterId");
    const courseId = searchParams.get("courseId");

    if (chapterId) {
      // Get progress for specific chapter
      const progress = await db.userProgress.findUnique({
        where: {
          studentId_chapterId: {
            studentId: studentProfile.id,
            chapterId: chapterId,
          },
        },
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
      });

      // Calculate current chapter score even if no progress record exists
      const calculation = await calculateChapterScore(
        studentProfile.id,
        chapterId
      );

      return NextResponse.json({
        progress,
        chapterScore: calculation.chapterScore,
        quizSummary: {
          totalQuizzes: calculation.totalQuizzes,
          passedQuizzes: calculation.passedQuizzes,
          isCompleted: calculation.isCompleted,
        },
      });
    }

    if (courseId) {
      // Get progress for all chapters in a course
      const progress = await db.userProgress.findMany({
        where: {
          studentId: studentProfile.id,
          chapter: {
            courseId: courseId,
          },
        },
        include: {
          chapter: {
            select: {
              id: true,
              title: true,
              position: true,
              duration: true,
            },
          },
        },
        orderBy: {
          chapter: {
            position: "asc",
          },
        },
      });

      // Calculate scores for all chapters
      const progressWithScores = await Promise.all(
        progress.map(async (p) => {
          const calculation = await calculateChapterScore(
            studentProfile.id,
            p.chapterId
          );
          return {
            ...p,
            calculatedScore: calculation.chapterScore,
            quizSummary: {
              totalQuizzes: calculation.totalQuizzes,
              passedQuizzes: calculation.passedQuizzes,
              isCompleted: calculation.isCompleted,
            },
          };
        })
      );

      return NextResponse.json({ progress: progressWithScores });
    }

    // Get all progress for the student
    const allProgress = await db.userProgress.findMany({
      where: {
        studentId: studentProfile.id,
      },
      include: {
        chapter: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastWatchedAt: "desc",
      },
      take: 50, // Limit to recent progress
    });

    return NextResponse.json({ progress: allProgress });
  } catch (error) {
    console.error("[PROGRESS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
