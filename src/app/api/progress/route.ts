import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { z } from "zod";

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

    // Prepare update data
    const updateData: any = {
      lastWatchedAt: new Date(),
    };

    if (watchedSeconds !== undefined) {
      updateData.watchedSeconds = watchedSeconds;
    }

    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted;
      if (isCompleted) {
        updateData.completedAt = new Date();
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes;
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
        isCompleted: isCompleted || false,
      },
    });

    return NextResponse.json({
      message: "Progress updated successfully",
      progress,
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

      return NextResponse.json({ progress });
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

      return NextResponse.json({ progress });
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
