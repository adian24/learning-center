// actions/course.ts
"use server";

import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { courseFormSchema, CourseFormValues } from "@/lib/validations/courses";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCourse(
  prevState: {
    success: boolean;
    error?: string;
    errors?: Partial<Record<keyof CourseFormValues, string[]>>;
  },
  formData: FormData
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  try {
    // Parse form data using Zod schema
    const validatedFields = courseFormSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      imageUrl: formData.get("imageUrl"),
      price: formData.get("price") ? Number(formData.get("price")) : 0,
      categoryId: formData.get("categoryId"),
      level: formData.get("level") || "BEGINNER",
    });

    // Check validation
    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // Find teacher profile
    const teacherProfile = await db.teacherProfile.findUnique({
      where: { userId: userId },
    });

    if (!teacherProfile) {
      return {
        success: false,
        error: "Teacher profile not found",
      };
    }

    // Create course
    await db.course.create({
      data: {
        ...validatedFields.data,
        teacherId: teacherProfile.id,
      },
    });

    // Revalidate and redirect
    revalidatePath("/teacher/courses");
    redirect(`/teacher/courses`);
  } catch (error) {
    console.error("[CREATE_COURSE_SERVER_ACTION]", error);
    return {
      success: false,
      error: "Failed to create course",
    };
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
