// app/api/categories/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db/db";

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("[CATEGORIES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST endpoint untuk membuat category baru (opsional, untuk admin)
export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Generate slug dari nama
    const slug = name.toLowerCase().replace(/ /g, "-");

    const category = await db.category.create({
      data: {
        name,
        slug,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORIES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
