// app/api/courses/upload/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new NextResponse("No file provided", { status: 400 });
    }

    // Convert File to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const response = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "course-thumbnails",
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
            max_bytes: 4000000, // 4MB
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(result);
          }
        )
        .end(buffer);
    });

    if (
      !response ||
      typeof response !== "object" ||
      !("secure_url" in response)
    ) {
      throw new Error("Invalid response from Cloudinary");
    }

    return NextResponse.json({
      success: true,
      url: response.secure_url,
    });
  } catch (error) {
    console.error("[COURSE_IMAGE_UPLOAD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Untuk menangani penghapusan gambar (opsional)
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return new NextResponse("Public ID is required", { status: 400 });
    }

    const response = await cloudinary.uploader.destroy(
      `course-thumbnails/${publicId}`
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("[COURSE_IMAGE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
