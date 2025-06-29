// app/api/courses/similar/route.ts
import db from "@/lib/db/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const courseId = searchParams.get("courseId");
  const limit = parseInt(searchParams.get("limit") || "3");

  if (!courseId) {
    return NextResponse.json(
      { error: "Course ID is required" },
      { status: 400 }
    );
  }

  try {
    // Get the current course
    const currentCourse = await db.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        teacherId: true,
        categoryId: true,
      },
    });

    if (!currentCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // First try to find courses by the same teacher
    let similarCourses = await db.course.findMany({
      where: {
        teacherId: currentCourse.teacherId,
        id: { not: courseId },
        isPublished: true,
      },
      include: {
        teacher: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            profileUrl: true,
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
        category: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            enrolledStudents: true,
          },
        },
      },
      take: limit,
    });

    // If the teacher has no other courses, find courses in the same category
    if (similarCourses.length === 0 && currentCourse.categoryId) {
      similarCourses = await db.course.findMany({
        where: {
          categoryId: currentCourse.categoryId,
          id: { not: courseId },
          isPublished: true,
        },
        include: {
          teacher: {
            include: {
              user: {
                select: {
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
          category: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              enrolledStudents: true,
            },
          },
        },
        take: limit,
      });
    }

    // If still no similar courses, return popular courses
    if (similarCourses.length === 0) {
      similarCourses = await db.course.findMany({
        where: {
          id: { not: courseId },
          isPublished: true,
        },
        orderBy: {
          rating: "desc",
        },
        include: {
          teacher: {
            include: {
              user: {
                select: {
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
          category: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              enrolledStudents: true,
            },
          },
        },
        take: limit,
      });
    }

    // Add a field to indicate why these courses are being recommended
    const recommendationType =
      similarCourses.length > 0 &&
      similarCourses[0].teacherId === currentCourse.teacherId
        ? "SAME_TEACHER"
        : similarCourses.length > 0 &&
          similarCourses[0].categoryId === currentCourse.categoryId
        ? "SAME_CATEGORY"
        : "POPULAR";

    return NextResponse.json({
      similarCourses,
      recommendationType,
    });
  } catch (error) {
    console.error("Error fetching similar courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch similar courses" },
      { status: 500 }
    );
  }
}
