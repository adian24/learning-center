// app/api/student/dashboard/profile/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

async function ensureStudentProfile(userId: string): Promise<string> {
  try {
    // Check if profile exists
    let studentProfile = await db.studentProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    // If not, create it
    if (!studentProfile) {
      studentProfile = await db.studentProfile.create({
        data: { userId },
        select: { id: true },
      });
    }

    return studentProfile.id;
  } catch (error: any) {
    // Handle potential race condition where another request created the profile
    if (error?.code === "P2002") {
      // Prisma unique constraint error
      const studentProfile = await db.studentProfile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (studentProfile) {
        return studentProfile.id;
      }
    }

    throw error;
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const studentProfileId = await ensureStudentProfile(
      session?.user.id as string
    );

    // Find the student profile for the current user
    const studentProfile = await db.studentProfile.findUnique({
      where: {
        userId: studentProfileId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        quizAttempts: {
          select: {
            score: true,
          },
        },
        progress: {
          select: {
            isCompleted: true,
            watchedSeconds: true,
          },
        },
      },
    });

    if (!studentProfile) {
      return new NextResponse("Student profile not found", { status: 404 });
    }

    // Calculate XP based on quiz scores and completed chapters
    const quizXP = studentProfile.quizAttempts.reduce((total, attempt) => {
      // Award 5 XP for each 10% score in quizzes
      return total + Math.floor((attempt.score / 10) * 5);
    }, 0);

    // Award 10 XP for each completed chapter
    const watchXP =
      studentProfile.progress.filter((p) => p.isCompleted).length * 10;

    // Total XP
    const currentXP = quizXP + watchXP;

    // Max XP is arbitrary, but we'll set it to a round number above current XP
    const maxXP = Math.max(80, Math.ceil(currentXP / 10) * 10 + 20);

    return NextResponse.json({
      name: studentProfile.user.name,
      email: studentProfile.user.email,
      image: studentProfile.user.image,
      currentXP,
      maxXP,
    });
  } catch (error) {
    console.error("[STUDENT_DASHBOARD_PROFILE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
