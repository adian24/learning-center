import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { NextResponse } from "next/server";

// GET all courses
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("perPage") || "10");

    // Get teacher profile
    const teacherProfile = await db.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherProfile) {
      return new NextResponse("Teacher profile not found", { status: 404 });
    }

    // Get courses with company information
    const [courses, total] = await Promise.all([
      db.course.findMany({
        where: {
          teacherId: teacherProfile.id,
        },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              company: {
                select: {
                  id: true,
                  name: true,
                  logoUrl: true,
                  location: true,
                  industry: true,
                },
              },
            },
          },
          chapters: true,
          _count: {
            select: {
              enrolledStudents: {
                where: {
                  status: "COMPLETED",
                },
              },
              chapters: true,
            },
          },
        },
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: {
          createdAt: "desc",
        },
      }),
      db.course.count({
        where: {
          teacherId: teacherProfile.id,
        },
      }),
    ]);

    // Format courses with enrollment count and chapter count
    const formattedCourses = courses.map((course) => ({
      ...course,
      enrolledCount: course._count.enrolledStudents,
      chapterCount: course._count.chapters,
    }));

    return NextResponse.json({
      courses: formattedCourses,
      meta: {
        totalPages: Math.ceil(total / perPage),
        currentPage: page,
        hasNextPage: page < Math.ceil(total / perPage),
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("[TEACHER_COURSES_GET]", error);
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

    console.log("[COURSES_POST] Body : ", body);

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

    console.log("[COURSES_POST] Course Res : ", course);

    return NextResponse.json(course);
  } catch (error) {
    console.error("[COURSES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
