// src/lib/actions/course.actions.ts

import db from "../db/db";

export async function getCourseById(courseId: string) {
  if (!courseId) {
    console.error("Invalid courseId: courseId is undefined or empty");
    return null;
  }

  try {
    const course = await db.course.findUnique({
      where: {
        id: courseId,
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
          },
        },
        category: true,
        chapters: {
          where: {
            isPublished: true,
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    return course;
  } catch (error) {
    console.error("Error fetching course:", error);
    return null;
  }
}

export async function isEnrolled({
  userId,
  courseId,
}: {
  userId: string;
  courseId: string;
}) {
  try {
    // First, get the student profile
    const studentProfile = await db.studentProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!studentProfile) {
      return false;
    }

    // Check if the student is enrolled in the course
    const enrollment = await db.enrolledCourse.findUnique({
      where: {
        studentId_courseId: {
          studentId: studentProfile.id,
          courseId: courseId,
        },
      },
    });

    return !!enrollment;
  } catch (error) {
    console.error("Error checking enrollment status:", error);
    return false;
  }
}

export async function enrollInCourse({
  userId,
  courseId,
  amount,
  currency = "USD",
  paymentId,
}: {
  userId: string;
  courseId: string;
  amount: number;
  currency?: string;
  paymentId?: string;
}) {
  try {
    // Get or create student profile
    let studentProfile = await db.studentProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!studentProfile) {
      studentProfile = await db.studentProfile.create({
        data: {
          userId: userId,
        },
      });
    }

    // Create enrollment record
    const enrollment = await db.enrolledCourse.create({
      data: {
        studentId: studentProfile.id,
        courseId: courseId,
        amount: amount,
        currency: currency,
        paymentId: paymentId,
        status: "COMPLETED",
      },
    });

    return enrollment;
  } catch (error) {
    console.error("Error enrolling in course:", error);
    throw new Error("Failed to enroll in course");
  }
}
