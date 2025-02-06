// app/api/courses/route.ts
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, description, imageUrl, price, categoryId, level } =
      await req.json();

    // Validasi input
    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    // Dapatkan teacher profile
    const teacherProfile = await db.teacherProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!teacherProfile) {
      return new NextResponse("Teacher profile not found", { status: 404 });
    }

    // Buat course baru
    const course = await db.course.create({
      data: {
        title,
        description,
        imageUrl,
        price,
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
