// app/api/courses/route.ts
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { NextResponse } from "next/server";

// GET all courses
export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get URL parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("perPage") || "10");

    // Calculate skip
    const skip = (page - 1) * perPage;

    // Get teacher profile
    const teacherProfile = await db.teacherProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!teacherProfile) {
      return new NextResponse("Teacher profile not found", { status: 404 });
    }

    // Get total count
    const total = await db.course.count({
      where: {
        teacherId: teacherProfile.id,
      },
    });

    // Get paginated courses
    const courses = await db.course.findMany({
      where: {
        teacherId: teacherProfile.id,
      },
      include: {
        category: true,
        chapters: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: perPage,
    });

    // Calculate total duration for each course
    const coursesWithDuration = courses.map((course) => {
      // Calculate total duration from chapters
      const totalDuration = course.chapters.reduce((total, chapter) => {
        return total + (chapter.duration || 0);
      }, 0);

      return {
        ...course,
        duration: totalDuration,
      };
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / perPage);

    // Prepare response
    const response = {
      courses: coursesWithDuration ?? [],
      meta: {
        currentPage: page,
        totalPages,
        perPage,
        total,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[COURSES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST new courses
export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const { title, description, imageUrl, price, categoryId, level } = body;

    const parsedPrice = price ? parseFloat(price) : 0;

    const teacherProfile = await db.teacherProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!teacherProfile) {
      return new NextResponse("Teacher profile not found", { status: 404 });
    }

    const course = await db.course.create({
      data: {
        title,
        description,
        imageUrl,
        price: parsedPrice,
        categoryId,
        level,
        teacherId: teacherProfile.id,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("[COURSES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
