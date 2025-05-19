// app/api/courses/upload/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { s3Client } from "@/lib/s3";
import { uploadFile } from "@/lib/services/s3/upload-file";

const BUCKET_NAME = process.env.IDCLOUD_BUCKET_NAME;
const FOLDER_NAME = "course-thumbnails";

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

    // Check file type
    const fileType = file.type;
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!validTypes.includes(fileType)) {
      return new NextResponse(
        "Invalid file format. Supported formats: JPG, JPEG, PNG, WEBP",
        {
          status: 400,
        }
      );
    }

    // Check file size (4MB limit)
    if (file.size > 4000000) {
      return new NextResponse("File too large. Maximum size is 4MB", {
        status: 400,
      });
    }

    // Generate a unique filename
    const fileExtension = fileType.split("/")[1];
    const fileName = `${FOLDER_NAME}/${uuidv4()}.${fileExtension}`;

    const fileUrl = uploadFile(file, fileName);

    return NextResponse.json({
      success: true,
      url: fileUrl,
    });
  } catch (error) {
    console.error("[COURSE_IMAGE_UPLOAD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return new NextResponse("File key is required", { status: 400 });
    }

    // Delete the file from S3
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("[COURSE_IMAGE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
