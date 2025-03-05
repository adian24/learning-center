// src/app/api/courses/[courseId]/learning-objectives/reorder/route.ts

import { NextRequest, NextResponse } from "next/server";
import { reorderLearningObjectives } from "@/lib/services/learning-objective-service";
import { z } from "zod";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courseId = (await params).courseId;

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Check if the user is authorized to update this course's objectives
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: { teacher: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.teacher.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to update this course's learning objectives" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const schema = z.object({
      orderedIds: z.array(z.string().min(1)),
    });

    const validation = schema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      );
    }

    const { orderedIds } = validation.data;

    // Validate that all IDs belong to this course
    const objectives = await db.learningObjective.findMany({
      where: { courseId },
      select: { id: true },
    });

    const courseObjectiveIds = objectives.map((obj) => obj.id);
    const allIdsValid = orderedIds.every((id) =>
      courseObjectiveIds.includes(id)
    );

    if (!allIdsValid || orderedIds.length !== courseObjectiveIds.length) {
      return NextResponse.json(
        { error: "Invalid learning objective IDs provided" },
        { status: 400 }
      );
    }

    await reorderLearningObjectives(orderedIds);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[LEARNING_OBJECTIVES_REORDER]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
