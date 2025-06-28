import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const values = await req.json();

    // Check if user already has a teacher profile
    const existingProfile = await db.teacherProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (existingProfile) {
      return new NextResponse("Teacher profile already exists", {
        status: 400,
      });
    }

    const teacherProfile = await db.teacherProfile.create({
      data: {
        userId: session.user.id,
        bio: values.bio,
        expertise: values.expertise,
        profileUrl: values.profileUrl,
        ...(values.companyId && { companyId: values.companyId }),
      },
    });

    return NextResponse.json(teacherProfile);
  } catch (error) {
    console.error("[TEACHER_REGISTRATION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
