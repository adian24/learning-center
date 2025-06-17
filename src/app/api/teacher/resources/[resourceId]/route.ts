import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { NextResponse } from "next/server";

// GET single resource
export async function GET(
  req: Request,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resourceId = (await params).resourceId;

    if (!resourceId) {
      return new NextResponse("Resource ID is required", { status: 400 });
    }

    // Get teacher profile
    const teacherProfile = await db.teacherProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!teacherProfile) {
      return new NextResponse("Teacher profile not found", { status: 404 });
    }

    // Get resource and verify ownership
    const resource = await db.resource.findFirst({
      where: {
        id: resourceId,
        chapter: {
          course: {
            teacherId: teacherProfile.id,
          },
        },
      },
      include: {
        chapter: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!resource) {
      return new NextResponse("Resource not found", { status: 404 });
    }

    return NextResponse.json(resource);
  } catch (error) {
    console.error("[RESOURCE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PUT update resource
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resourceId = (await params).resourceId;
    const body = await req.json();
    const { title, content, summary, readTime } = body;

    if (!resourceId) {
      return new NextResponse("Resource ID is required", { status: 400 });
    }

    console.log("[RESOURCE_PUT] Body:", body);

    // Get teacher profile
    const teacherProfile = await db.teacherProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!teacherProfile) {
      return new NextResponse("Teacher profile not found", { status: 404 });
    }

    // Verify resource exists and belongs to teacher
    const existingResource = await db.resource.findFirst({
      where: {
        id: resourceId,
        chapter: {
          course: {
            teacherId: teacherProfile.id,
          },
        },
      },
    });

    if (!existingResource) {
      return new NextResponse("Resource not found", { status: 404 });
    }

    // Update resource
    const updatedResource = await db.resource.update({
      where: {
        id: resourceId,
      },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(summary !== undefined && { summary }),
        ...(readTime !== undefined && {
          readTime: readTime ? parseInt(readTime) : null,
        }),
      },
      include: {
        chapter: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    console.log("[RESOURCE_PUT] Resource updated:", updatedResource);

    return NextResponse.json(updatedResource);
  } catch (error) {
    console.error("[RESOURCE_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE resource
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resourceId = (await params).resourceId;

    if (!resourceId) {
      return new NextResponse("Resource ID is required", { status: 400 });
    }

    // Get teacher profile
    const teacherProfile = await db.teacherProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!teacherProfile) {
      return new NextResponse("Teacher profile not found", { status: 404 });
    }

    // Verify resource exists and belongs to teacher
    const existingResource = await db.resource.findFirst({
      where: {
        id: resourceId,
        chapter: {
          course: {
            teacherId: teacherProfile.id,
          },
        },
      },
    });

    if (!existingResource) {
      return new NextResponse("Resource not found", { status: 404 });
    }

    // Delete resource
    await db.resource.delete({
      where: {
        id: resourceId,
      },
    });

    console.log("[RESOURCE_DELETE] Resource deleted:", resourceId);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[RESOURCE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
