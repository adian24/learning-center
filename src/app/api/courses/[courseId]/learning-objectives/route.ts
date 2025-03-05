// src/app/api/courses/[courseId]/learning-objectives/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  createLearningObjective,
  getLearningObjectivesByCourse,
} from "@/lib/services/learning-objective-service";
import { auth } from "@/lib/auth";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const courseId = (await params).courseId;

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    const learningObjectives = await getLearningObjectivesByCourse(courseId);

    return NextResponse.json({ learningObjectives }, { status: 200 });
  } catch (error) {
    console.error("[LEARNING_OBJECTIVES_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    // Get the current count to determine position
    const currentObjectives = await getLearningObjectivesByCourse(courseId);
    const nextPosition = currentObjectives.length;

    const body = await request.json();

    const schema = z.object({
      text: z.string().min(1, "Learning objective text is required"),
    });

    const validation = schema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      );
    }

    const { text } = validation.data;

    const learningObjective = await createLearningObjective({
      text,
      position: nextPosition,
      courseId,
    });

    return NextResponse.json({ learningObjective }, { status: 201 });
  } catch (error) {
    console.error("[LEARNING_OBJECTIVES_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
