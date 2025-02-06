// actions/course.ts
"use server";

import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { courseFormSchema } from "@/lib/validations/courses";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCourse(values: FormData) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get form data
    const validatedFields = courseFormSchema.parse({
      title: values.get("title"),
      description: values.get("description"),
      imageUrl: values.get("imageUrl"),
      price: values.get("price"),
      categoryId: values.get("categoryId"),
      level: values.get("level"),
    });

    // Get teacher profile
    const teacherProfile = await db.teacherProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!teacherProfile) {
      throw new Error("Teacher profile not found");
    }

    // Create course
    const course = await db.course.create({
      data: {
        title: validatedFields.title,
        description: validatedFields.description,
        imageUrl: validatedFields.imageUrl,
        price: validatedFields.price,
        categoryId: validatedFields.categoryId,
        level: validatedFields.level,
        teacherId: teacherProfile.id,
      },
    });

    if (!course) {
      throw new Error("Failed to create course");
    }

    revalidatePath("/teacher/courses");
    redirect(`/teacher/courses/${course.id}`);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create course: ${error.message}`);
    }
    throw new Error("Failed to create course");
  }
}

export async function getCourseCategories() {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return categories;
  } catch (error) {
    console.error("[GET_CATEGORIES]", error);
    throw new Error("Failed to fetch categories");
  }
}

export async function getTeacherCourses() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const teacherProfile = await db.teacherProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!teacherProfile) {
      throw new Error("Teacher profile not found");
    }

    const courses = await db.course.findMany({
      where: {
        teacherId: teacherProfile.id,
      },
      include: {
        category: true,
        chapters: {
          select: {
            id: true,
          },
        },
        enrolledStudents: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return courses;
  } catch (error) {
    console.error("[GET_COURSES]", error);
    throw new Error("Failed to fetch courses");
  }
}

export async function getCourseById(courseId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const course = await db.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        category: true,
        chapters: {
          orderBy: {
            position: "asc",
          },
        },
        enrolledStudents: {
          include: {
            student: true,
          },
        },
        teacher: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    return course;
  } catch (error) {
    console.error("[GET_COURSE]", error);
    throw new Error("Failed to fetch course");
  }
}

export async function updateCourse(courseId: string, values: FormData) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const validatedFields = courseFormSchema.parse({
      title: values.get("title"),
      description: values.get("description"),
      imageUrl: values.get("imageUrl"),
      price: values.get("price"),
      categoryId: values.get("categoryId"),
      level: values.get("level"),
    });

    const course = await db.course.update({
      where: {
        id: courseId,
      },
      data: {
        ...validatedFields,
      },
    });

    if (!course) {
      throw new Error("Failed to update course");
    }

    revalidatePath("/teacher/courses");
    redirect(`/teacher/courses/${course.id}`);
  } catch (error) {
    console.error("[UPDATE_COURSE]", error);
    throw new Error("Failed to update course");
  }
}
