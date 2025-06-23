import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

/**
 * GET: Fetch comprehensive student details for teacher
 * Returns:
 * - Student profile and user information
 * - All enrollments in teacher's courses with progress
 * - Quiz attempts and scores
 * - Certificates earned
 * - Reviews given by student
 * - Overall statistics and performance metrics
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const studentId = (await params).studentId;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get teacher profile
    const teacherProfile = await db.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    // Get all teacher's course IDs for permission verification
    const teacherCourses = await db.course.findMany({
      where: { teacherId: teacherProfile.id },
      select: { id: true },
    });

    const teacherCourseIds = teacherCourses.map((course) => course.id);

    if (teacherCourseIds.length === 0) {
      return NextResponse.json(
        { error: "No courses found for teacher" },
        { status: 404 }
      );
    }

    // Fetch comprehensive student data
    const studentProfile = await db.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
        enrolledCourses: {
          where: {
            courseId: {
              in: teacherCourseIds, // Only courses from this teacher
            },
          },
          include: {
            course: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                chapters: {
                  where: {
                    isPublished: true,
                  },
                  select: {
                    id: true,
                    title: true,
                    position: true,
                    duration: true,
                    userProgress: {
                      where: {
                        studentId: studentId,
                      },
                      select: {
                        id: true,
                        isCompleted: true,
                        watchedSeconds: true,
                        lastWatchedAt: true,
                        completedAt: true,
                        chapterScore: true,
                      },
                    },
                  },
                  orderBy: {
                    position: "asc",
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        certificates: {
          where: {
            courseId: {
              in: teacherCourseIds,
            },
          },
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: {
            issueDate: "desc",
          },
        },
        reviews: {
          where: {
            courseId: {
              in: teacherCourseIds,
            },
          },
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        quizAttempts: {
          where: {
            quiz: {
              chapter: {
                courseId: {
                  in: teacherCourseIds,
                },
              },
            },
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
            answers: {
              include: {
                question: {
                  select: {
                    id: true,
                    text: true,
                    points: true,
                    type: true,
                  },
                },
                selectedOption: {
                  select: {
                    id: true,
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
        },
        progress: {
          where: {
            chapter: {
              courseId: {
                in: teacherCourseIds,
              },
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
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    if (!studentProfile) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Verify student has enrollment in at least one teacher's course
    if (studentProfile.enrolledCourses.length === 0) {
      return NextResponse.json(
        { error: "Student not enrolled in any of your courses" },
        { status: 403 }
      );
    }

    // Calculate comprehensive statistics
    const stats = {
      totalCourses: studentProfile.enrolledCourses.length,
      completedCourses: 0,
      inProgressCourses: 0,
      totalChapters: 0,
      completedChapters: 0,
      totalWatchTime: 0,
      averageProgress: 0,
      totalQuizAttempts: studentProfile.quizAttempts.length,
      averageQuizScore: 0,
      totalCertificates: studentProfile.certificates.length,
      totalReviews: studentProfile.reviews.length,
      averageRatingGiven: 0,
    };

    // Calculate course progress and statistics
    const coursesProgress = studentProfile.enrolledCourses.map((enrollment) => {
      const totalChapters = enrollment.course.chapters.length;
      const completedChapters = enrollment.course.chapters.filter(
        (chapter) => chapter.userProgress?.[0]?.isCompleted
      ).length;

      const progress =
        totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

      // Calculate total watch time for this course
      const courseWatchTime = enrollment.course.chapters.reduce(
        (total, chapter) => {
          const userProgress = chapter.userProgress?.[0];
          return total + (userProgress?.watchedSeconds || 0);
        },
        0
      );

      // Determine course status
      let status = "not_started";
      if (progress === 100) {
        status = "completed";
        stats.completedCourses++;
      } else if (progress > 0) {
        status = "in_progress";
        stats.inProgressCourses++;
      }

      // Update overall stats
      stats.totalChapters += totalChapters;
      stats.completedChapters += completedChapters;
      stats.totalWatchTime += courseWatchTime;

      return {
        ...enrollment,
        progress: Math.round(progress * 100) / 100,
        status,
        totalChapters,
        completedChapters,
        watchTimeSeconds: courseWatchTime,
        lastActivity:
          enrollment.course.chapters
            .flatMap((chapter) => chapter.userProgress)
            .filter((progress) => progress?.lastWatchedAt)
            .sort(
              (a, b) =>
                new Date(b!.lastWatchedAt!).getTime() -
                new Date(a!.lastWatchedAt!).getTime()
            )[0]?.lastWatchedAt || null,
      };
    });

    // Calculate average progress
    stats.averageProgress =
      stats.totalChapters > 0
        ? Math.round((stats.completedChapters / stats.totalChapters) * 10000) /
          100
        : 0;

    // Calculate average quiz score
    if (studentProfile.quizAttempts.length > 0) {
      const totalScore = studentProfile.quizAttempts.reduce(
        (sum, attempt) => sum + attempt.score,
        0
      );
      stats.averageQuizScore =
        Math.round((totalScore / studentProfile.quizAttempts.length) * 100) /
        100;
    }

    // Calculate average rating given by student
    if (studentProfile.reviews.length > 0) {
      const totalRating = studentProfile.reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      stats.averageRatingGiven =
        Math.round((totalRating / studentProfile.reviews.length) * 100) / 100;
    }

    // Group quiz attempts by course for better organization
    const quizAttemptsByCourse = studentProfile.quizAttempts.reduce(
      (acc, attempt) => {
        const courseId = attempt.quiz.chapter.course.id;
        if (!acc[courseId]) {
          acc[courseId] = [];
        }
        acc[courseId].push(attempt);
        return acc;
      },
      {} as Record<string, typeof studentProfile.quizAttempts>
    );

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = {
      recentProgress: studentProfile.progress
        .filter((progress) => progress.updatedAt >= thirtyDaysAgo)
        .slice(0, 10),
      recentQuizAttempts: studentProfile.quizAttempts
        .filter((attempt) => attempt.startedAt >= thirtyDaysAgo)
        .slice(0, 10),
      recentReviews: studentProfile.reviews
        .filter((review) => review.createdAt >= thirtyDaysAgo)
        .slice(0, 5),
    };

    // Prepare final response
    const response = {
      student: {
        id: studentProfile.id,
        user: studentProfile.user,
        createdAt: studentProfile.createdAt,
        updatedAt: studentProfile.updatedAt,
      },
      enrollments: coursesProgress,
      certificates: studentProfile.certificates,
      reviews: studentProfile.reviews,
      quizAttempts: studentProfile.quizAttempts,
      quizAttemptsByCourse,
      progress: studentProfile.progress,
      recentActivity,
      stats,
      summary: {
        joinDate: studentProfile.createdAt,
        lastActivity:
          coursesProgress
            .map((course) => course.lastActivity)
            .filter(Boolean)
            .sort(
              (a, b) => new Date(b!).getTime() - new Date(a!).getTime()
            )[0] || null,
        totalWatchTimeFormatted: `${Math.floor(
          stats.totalWatchTime / 3600
        )}h ${Math.floor((stats.totalWatchTime % 3600) / 60)}m`,
        performanceLevel:
          stats.averageProgress >= 80
            ? "excellent"
            : stats.averageProgress >= 60
            ? "good"
            : stats.averageProgress >= 40
            ? "average"
            : "needs_improvement",
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[TEACHER_STUDENT_DETAIL_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
