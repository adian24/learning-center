// src/app/api/learning-objectives/[objectiveId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  updateLearningObjective,
  deleteLearningObjective,
} from "@/lib/services/learning-objective-service";
import { z } from "zod";
import db from "@/lib/db/db";
import { auth } from "@/lib/auth";

// GET a single learning objective
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ objectiveId: string }> }
) {
  try {
    const objectiveId = (await params).objectiveId;

    if (!objectiveId) {
      return NextResponse.json(
        { error: "Learning objective ID is required" },
        { status: 400 }
      );
    }

    const learningObjective = await db.learningObjective.findUnique({
      where: { id: objectiveId },
    });

    if (!learningObjective) {
      return NextResponse.json(
        { error: "Learning objective not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ learningObjective }, { status: 200 });
  } catch (error) {
    console.error("[LEARNING_OBJECTIVE_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH to update a learning objective
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ objectiveId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const objectiveId = (await params).objectiveId;

    if (!objectiveId) {
      return NextResponse.json(
        { error: "Learning objective ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const schema = z.object({
      text: z.string().min(1, "Learning objective text is required").optional(),
      position: z.number().int().nonnegative().optional(),
    });

    const validation = schema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      );
    }

    // First check if the objective exists and get its courseId
    const existingObjective = await db.learningObjective.findUnique({
      where: { id: objectiveId },
      select: { courseId: true },
    });

    if (!existingObjective) {
      return NextResponse.json(
        { error: "Learning objective not found" },
        { status: 404 }
      );
    }

    // Then check if the user is authorized to update this course's objectives
    const course = await db.course.findUnique({
      where: { id: existingObjective.courseId },
      include: { teacher: true },
    });

    if (course?.teacher.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to update this course's learning objectives" },
        { status: 403 }
      );
    }

    const learningObjective = await updateLearningObjective(
      objectiveId,
      validation.data
    );

    return NextResponse.json({ learningObjective }, { status: 200 });
  } catch (error) {
    console.error("[LEARNING_OBJECTIVE_PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE a learning objective
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ objectiveId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const objectiveId = (await params).objectiveId;

    if (!objectiveId) {
      return NextResponse.json(
        { error: "Learning objective ID is required" },
        { status: 400 }
      );
    }

    // First check if the objective exists and get its courseId
    const existingObjective = await db.learningObjective.findUnique({
      where: { id: objectiveId },
      select: { courseId: true },
    });

    if (!existingObjective) {
      return NextResponse.json(
        { error: "Learning objective not found" },
        { status: 404 }
      );
    }

    // Then check if the user is authorized to delete this course's objectives
    const course = await db.course.findUnique({
      where: { id: existingObjective.courseId },
      include: { teacher: true },
    });

    if (course?.teacher.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this course's learning objectives" },
        { status: 403 }
      );
    }

    await deleteLearningObjective(objectiveId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[LEARNING_OBJECTIVE_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
