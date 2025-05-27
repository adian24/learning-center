// app/api/teacher/students/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "enrollmentDate";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Find the teacher profile for the current user
    const teacherProfile = await db.teacherProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!teacherProfile) {
      return new NextResponse("Teacher profile not found", { status: 404 });
    }

    // Get all course IDs for this teacher
    const courses = await db.course.findMany({
      where: {
        teacherId: teacherProfile.id,
      },
      select: {
        id: true,
        title: true,
      },
    });

    const courseIds = courses.map((course) => course.id);

    if (courseIds.length === 0) {
      return NextResponse.json({
        students: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalStudents: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        stats: {
          totalStudents: 0,
          averageProgress: 0,
          recentStudents: 0,
        },
      });
    }

    // Build search conditions
    const searchConditions = search
      ? {
          OR: [
            {
              user: {
                name: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              user: {
                email: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            },
          ],
        }
      : {};

    // Get total count for pagination
    const totalStudents = await db.studentProfile.count({
      where: {
        ...searchConditions,
        enrolledCourses: {
          some: {
            courseId: {
              in: courseIds,
            },
            status: "COMPLETED",
          },
        },
      },
    });

    // Define sort mapping
    const sortMapping: Record<string, any> = {
      name: { user: { name: sortOrder } },
      enrollmentDate: { createdAt: sortOrder },
      progress: { createdAt: sortOrder }, // We'll sort by progress in memory since it's calculated
    };

    // Find all students enrolled in this teacher's courses with detailed info
    const studentsData = await db.studentProfile.findMany({
      where: {
        ...searchConditions,
        enrolledCourses: {
          some: {
            courseId: {
              in: courseIds,
            },
            status: "COMPLETED",
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        enrolledCourses: {
          where: {
            courseId: {
              in: courseIds,
            },
            status: "COMPLETED",
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
        progress: {
          where: {
            chapter: {
              courseId: {
                in: courseIds,
              },
            },
          },
          select: {
            isCompleted: true,
            chapterId: true,
          },
        },
      },
      orderBy:
        sortBy !== "progress" ? sortMapping[sortBy] : { createdAt: "desc" },
      skip: sortBy !== "progress" ? skip : undefined,
      take: sortBy !== "progress" ? limit : undefined,
    });

    // Format and process student data
    const formattedStudents = studentsData.map((studentProfile) => {
      // Get unique course titles
      const enrolledCourses = Array.from(
        new Set(
          studentProfile.enrolledCourses.map(
            (enrollment) => enrollment.course.title
          )
        )
      );

      // Calculate progress percentage
      const totalLessons = studentProfile.progress.length;
      const completedLessons = studentProfile.progress.filter(
        (p) => p.isCompleted
      ).length;
      const progressPercentage =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      // Get earliest enrollment date for this teacher's courses
      const enrollmentDate =
        studentProfile.enrolledCourses.length > 0
          ? studentProfile.enrolledCourses[0].createdAt
          : new Date();

      return {
        id: studentProfile.user.id,
        studentId: studentProfile.id,
        name: studentProfile.user.name || "Unknown",
        email: studentProfile.user.email || "",
        image: studentProfile.user.image,
        enrolledCourses,
        enrollmentDate: enrollmentDate.toISOString(),
        progressPercentage,
      };
    });

    // Sort by progress if needed (in memory)
    let finalStudents = formattedStudents;
    if (sortBy === "progress") {
      finalStudents.sort((a, b) => {
        const comparison = a.progressPercentage - b.progressPercentage;
        return sortOrder === "asc" ? comparison : -comparison;
      });
      // Apply pagination for progress sorting
      finalStudents = finalStudents.slice(skip, skip + limit);
    }

    // Calculate stats
    const totalPages = Math.ceil(totalStudents / limit);
    const averageProgress =
      formattedStudents.length > 0
        ? Math.round(
            formattedStudents.reduce(
              (sum, student) => sum + student.progressPercentage,
              0
            ) / formattedStudents.length
          )
        : 0;

    // Count recent students (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentStudents = formattedStudents.filter(
      (student) => new Date(student.enrollmentDate) >= weekAgo
    ).length;

    return NextResponse.json({
      students: finalStudents,
      pagination: {
        currentPage: page,
        totalPages,
        totalStudents,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      stats: {
        totalStudents: formattedStudents.length,
        averageProgress,
        recentStudents,
      },
    });
  } catch (error) {
    console.error("[TEACHER_STUDENTS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
