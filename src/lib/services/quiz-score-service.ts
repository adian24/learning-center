import db from "@/lib/db/db";
import { generateCertificatePDF } from "./certificate-service";

export interface ChapterScoreCalculation {
  chapterId: string;
  studentId: string;
  totalQuizzes: number;
  passedQuizzes: number;
  chapterScore: number;
  isCompleted: boolean;
}

/**
 * Calculate chapter score based on quiz results
 * Score = (number of passed quizzes / total quizzes) * 100
 * A quiz is considered "passed" if the student has at least one attempt with score >= passingScore
 */
export async function calculateChapterScore(
  studentId: string,
  chapterId: string
): Promise<ChapterScoreCalculation> {
  // Get all quizzes in the chapter
  const quizzes = await db.quiz.findMany({
    where: {
      chapterId,
    },
    include: {
      attempts: {
        where: {
          studentId,
        },
        select: {
          score: true,
        },
      },
    },
  });

  const totalQuizzes = quizzes.length;

  if (totalQuizzes === 0) {
    // If no quizzes in chapter, consider it completed with 100 score
    return {
      chapterId,
      studentId,
      totalQuizzes: 0,
      passedQuizzes: 0,
      chapterScore: 100,
      isCompleted: true,
    };
  }

  // Count how many quizzes the student has passed
  let passedQuizzes = 0;

  for (const quiz of quizzes) {
    // Check if student has at least one attempt with score >= passingScore
    const hasPassed = quiz.attempts.some(
      (attempt: { score: number }) => attempt.score >= quiz.passingScore
    );
    if (hasPassed) {
      passedQuizzes++;
    }
  }

  // Calculate chapter score
  const chapterScore = Math.round((passedQuizzes / totalQuizzes) * 100);
  const isCompleted = chapterScore >= 65; // Minimum passing score for chapter

  return {
    chapterId,
    studentId,
    totalQuizzes,
    passedQuizzes,
    chapterScore,
    isCompleted,
  };
}

/**
 * Update UserProgress with calculated chapter score
 */
export async function updateUserProgressScore(
  studentId: string,
  chapterId: string
): Promise<void> {
  const calculation = await calculateChapterScore(studentId, chapterId);

  // Update or create UserProgress record
  await db.userProgress.upsert({
    where: {
      studentId_chapterId: {
        studentId,
        chapterId,
      },
    },
    update: {
      chapterScore: calculation.chapterScore,
      isCompleted: calculation.isCompleted,
      completedAt: calculation.isCompleted ? new Date() : null,
      updatedAt: new Date(),
    },
    create: {
      studentId,
      chapterId,
      chapterScore: calculation.chapterScore,
      isCompleted: calculation.isCompleted,
      completedAt: calculation.isCompleted ? new Date() : null,
      watchedSeconds: 0,
    },
  });
}

/**
 * Check if student can proceed to next chapter
 */
export async function canProceedToNextChapter(
  studentId: string,
  currentChapterId: string
): Promise<boolean> {
  const userProgress = await db.userProgress.findUnique({
    where: {
      studentId_chapterId: {
        studentId,
        chapterId: currentChapterId,
      },
    },
  });

  if (!userProgress) {
    return false;
  }

  // Student can proceed if chapter score >= 65 or isCompleted is true
  return userProgress.isCompleted && (userProgress.chapterScore ?? 0) >= 65;
}

/**
 * Get student's progress for a specific chapter including quiz details
 */
export async function getChapterProgressWithQuizzes(
  studentId: string,
  chapterId: string
) {
  const userProgress = await db.userProgress.findUnique({
    where: {
      studentId_chapterId: {
        studentId,
        chapterId,
      },
    },
    include: {
      chapter: {
        include: {
          quizzes: {
            include: {
              attempts: {
                where: {
                  studentId,
                },
                orderBy: {
                  startedAt: "desc",
                },
              },
            },
          },
        },
      },
    },
  });

  if (!userProgress) {
    return null;
  }

  // Calculate current score
  const calculation = await calculateChapterScore(studentId, chapterId);

  return {
    ...userProgress,
    calculation,
  };
}

// Enhanced function untuk cek prerequisite completion
export async function canAccessChapter(
  studentId: string,
  targetChapterId: string
): Promise<{
  canAccess: boolean;
  reason: string;
  requiredChapter?: string;
}> {
  // Get target chapter
  const targetChapter = await db.chapter.findUnique({
    where: { id: targetChapterId },
    include: { course: true },
  });

  // Check if current chapter is already completed by the student
  const currentProgress = await db.userProgress.findUnique({
    where: {
      studentId_chapterId: {
        studentId,
        chapterId: targetChapterId,
      },
    },
  });

  // If chapter is already completed, always allow access
  if (currentProgress?.isCompleted) {
    return { canAccess: true, reason: "Chapter already completed" };
  }

  // Jika chapter pertama (position 1) atau isFree = true, selalu bisa akses
  if (targetChapter?.position === 1 || targetChapter?.isFree) {
    return { canAccess: true, reason: "First chapter or free chapter" };
  }

  // Get previous chapter (position - 1)
  let previousChapter = null;
  if (targetChapter && typeof targetChapter.position === "number") {
    previousChapter = await db.chapter.findFirst({
      where: {
        courseId: targetChapter.courseId,
        position: targetChapter.position - 1,
      },
    });
  }

  if (!previousChapter) {
    return { canAccess: true, reason: "No previous chapter required" };
  }

  // Check if previous chapter is completed
  const previousProgress = await db.userProgress.findUnique({
    where: {
      studentId_chapterId: {
        studentId,
        chapterId: previousChapter.id,
      },
    },
  });

  const isPreviousCompleted =
    previousProgress?.isCompleted && (previousProgress.chapterScore ?? 0) >= 65;

  return {
    canAccess: !!isPreviousCompleted,
    reason: isPreviousCompleted
      ? "Previous chapter completed"
      : "Must complete previous chapter first",
    requiredChapter: isPreviousCompleted ? undefined : previousChapter.id,
  };
}

// New function to handle course completion
export async function checkAndHandleCourseCompletion(
  studentId: string,
  courseId: string
) {
  try {
    // Get all published chapters for this course
    const chapters = await db.chapter.findMany({
      where: {
        courseId: courseId,
      },
      select: {
        id: true,
        title: true,
        position: true,
      },
      orderBy: {
        position: "asc",
      },
    });

    if (chapters.length === 0) {
      return;
    }

    // Get progress for all chapters
    const chapterProgress = await db.userProgress.findMany({
      where: {
        studentId: studentId,
        chapterId: {
          in: chapters.map((ch) => ch.id),
        },
      },
      select: {
        chapterId: true,
        isCompleted: true,
        chapterScore: true,
      },
    });

    // Check if all chapters are completed with passing score
    const completedChapters = chapterProgress.filter(
      (p) => p.isCompleted && (p.chapterScore || 0) >= 65
    );

    const isAllChaptersCompleted = completedChapters.length === chapters.length;

    if (isAllChaptersCompleted) {
      // Check if certificate already exists
      const existingCertificate = await db.certificate.findUnique({
        where: {
          studentId_courseId: {
            studentId: studentId,
            courseId: courseId,
          },
        },
      });

      if (!existingCertificate) {
        // Generate certificate
        await generateCourseCompletionCertificate(studentId, courseId);

        // Update enrollment status to completed
        await db.enrolledCourse.updateMany({
          where: {
            studentId: studentId,
            courseId: courseId,
          },
          data: {
            status: "COMPLETED",
            updatedAt: new Date(),
          },
        });
      }
    }
  } catch (error) {
    console.error("Error checking course completion:", error);
    // Don't throw error to avoid breaking chapter completion
  }
}

async function generateCourseCompletionCertificate(
  studentId: string,
  courseId: string
) {
  try {
    // Get course and student data
    const [course, student] = await Promise.all([
      db.course.findUnique({
        where: { id: courseId },
        include: {
          teacher: {
            include: {
              user: true,
              company: true,
            },
          },
          category: true,
        },
      }),
      db.studentProfile.findUnique({
        where: { id: studentId },
        include: {
          user: true,
        },
      }),
    ]);

    if (!course || !student) {
      throw new Error("Course or student not found");
    }

    // Generate unique certificate number
    const certificateNumber = await generateCertificateNumber();

    // Create certificate record
    const certificate = await db.certificate.create({
      data: {
        studentId: studentId,
        courseId: courseId,
        certificateNumber: certificateNumber,
        issueDate: new Date(),
        // pdfUrl will be set after PDF generation
      },
    });

    // Generate PDF certificate (implement this separately)
    const pdfUrl = await generateCertificatePDF({
      certificate,
      student,
      course,
    });

    // Update certificate with PDF URL
    await db.certificate.update({
      where: { id: certificate.id },
      data: { pdfUrl },
    });

    return certificate;
  } catch (error) {
    console.error("Error generating certificate:", error);
    throw error;
  }
}

async function generateCertificateNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");

  // Count certificates this month for sequence
  const startOfMonth = new Date(year, new Date().getMonth(), 1);
  const endOfMonth = new Date(year, new Date().getMonth() + 1, 0);

  const certificateCount = await db.certificate.count({
    where: {
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  const sequence = String(certificateCount + 1).padStart(4, "0");
  return `CERT-${year}${month}-${sequence}`;
}
