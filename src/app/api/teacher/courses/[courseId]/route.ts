// app/api/courses/[courseId]/route.ts
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { NextResponse } from "next/server";

// GET single course
export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const courseId = (await params).courseId;
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!courseId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const course = await db.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        category: true,
        chapters: true,
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Verify ownership
    const teacherProfile = await db.teacherProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!teacherProfile || course.teacherId !== teacherProfile.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Calculate total duration from chapters
    const totalDuration = course.chapters.reduce((total, chapter) => {
      return total + (chapter.duration || 0);
    }, 0);

    // Update course with calculated duration
    const courseWithDuration = {
      ...course,
      duration: totalDuration,
    };

    return NextResponse.json(courseWithDuration);
  } catch (error) {
    console.error("[COURSE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH (Update) course
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const courseId = (await params).courseId;
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const {
      title,
      description,
      imageUrl,
      price,
      categoryId,
      level,
      isPublished,
    } = await req.json();

    if (!title || !courseId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify ownership
    const teacherProfile = await db.teacherProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!teacherProfile) {
      return new NextResponse("Teacher profile not found", { status: 404 });
    }

    // Check if course exists and belongs to the teacher
    const existingCourse = await db.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!existingCourse || existingCourse.teacherId !== teacherProfile.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update course
    const updatedCourse = await db.course.update({
      where: {
        id: courseId,
      },
      data: {
        title,
        description,
        imageUrl,
        price,
        categoryId,
        level,
        isPublished,
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("[COURSE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE course
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const courseId = (await params).courseId;
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!courseId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify ownership
    const teacherProfile = await db.teacherProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!teacherProfile) {
      return new NextResponse("Teacher profile not found", { status: 404 });
    }

    // Check if course exists and belongs to the teacher
    const course = await db.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course || course.teacherId !== teacherProfile.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete course
    await db.course.delete({
      where: {
        id: courseId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[COURSE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
