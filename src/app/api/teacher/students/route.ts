// app/api/teacher/students/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

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
      },
    });

    const courseIds = courses.map((course) => course.id);

    // Find all students enrolled in this teacher's courses
    const enrollments = await db.enrolledCourse.findMany({
      where: {
        courseId: {
          in: courseIds,
        },
        status: "COMPLETED",
      },
      select: {
        id: true,
        createdAt: true,
        course: {
          select: {
            title: true,
          },
        },
        student: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
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
              },
            },
          },
        },
      },
    });

    // Format and deduplicate students
    const studentsMap = new Map();

    enrollments.forEach((enrollment) => {
      const student = enrollment.student;
      const studentId = student.user.id;

      if (!studentsMap.has(studentId)) {
        const completedLessons = student.progress.filter(
          (p) => p.isCompleted
        ).length;
        const totalLessons = student.progress.length;
        const progressPercentage =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        studentsMap.set(studentId, {
          id: studentId,
          studentId: student.id,
          name: student.user.name,
          email: student.user.email,
          image: student.user.image,
          enrolledCourses: [enrollment.course.title],
          enrollmentDate: enrollment.createdAt,
          progressPercentage,
        });
      } else {
        // Update existing student data with additional course
        const existingStudent = studentsMap.get(studentId);
        if (
          !existingStudent.enrolledCourses.includes(enrollment.course.title)
        ) {
          existingStudent.enrolledCourses.push(enrollment.course.title);
        }
      }
    });

    // Convert Map to Array for response
    const students = Array.from(studentsMap.values());

    return NextResponse.json(students);
  } catch (error) {
    console.error("[TEACHER_STUDENTS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
