import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        teacherProfile: {
          select: {
            id: true,
            bio: true,
            expertise: true,
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                industry: true,
              },
            },
          },
        },
        studentProfile: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Determine role based on profiles
    let role: "TEACHER" | "STUDENT" | null = null;
    let profile = null;

    if (user.teacherProfile) {
      role = "TEACHER";
      profile = user.teacherProfile;
    } else if (user.studentProfile) {
      role = "STUDENT";
      profile = user.studentProfile;
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role,
      profile,
    });
  } catch (error) {
    console.error("[USER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
