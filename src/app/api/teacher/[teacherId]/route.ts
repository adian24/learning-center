import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

// GET teacher profile by ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const teacherId = (await params).teacherId;

    const teacherProfile = await db.teacherProfile.findUnique({
      where: {
        id: teacherId,
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
        company: true,
      },
    });

    if (!teacherProfile) {
      return new NextResponse("Teacher profile not found", { status: 404 });
    }

    // Only allow access to own profile or admin users
    if (teacherProfile.userId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    return NextResponse.json(teacherProfile);
  } catch (error) {
    console.error("[TEACHER_PROFILE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH update teacher profile
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const teacherId = (await params).teacherId;
    const values = await req.json();

    // Check if teacher profile exists and belongs to current user
    const existingProfile = await db.teacherProfile.findUnique({
      where: {
        id: teacherId,
      },
    });

    if (!existingProfile) {
      return new NextResponse("Teacher profile not found", { status: 404 });
    }

    if (existingProfile.userId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Update teacher profile
    const updatedProfile = await db.teacherProfile.update({
      where: {
        id: teacherId,
      },
      data: {
        bio: values.bio,
        expertise: values.expertise,
        ...(values.companyId && { companyId: values.companyId }),
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
        company: true,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("[TEACHER_PROFILE_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
