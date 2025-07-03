import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

// GET /api/companies - List companies
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const includeJobs = searchParams.get("includeJobs") === "true";
    
    // Job filtering parameters
    const jobLevel = searchParams.get("jobLevel");
    const jobCategory = searchParams.get("jobCategory");
    const jobLocation = searchParams.get("jobLocation");
    const jobActive = searchParams.get("jobActive");
    const jobSearch = searchParams.get("jobSearch");

    // Build job filters
    const jobFilters: any = {};
    if (jobLevel) jobFilters.level = jobLevel;
    if (jobCategory) jobFilters.category = jobCategory;
    if (jobLocation) jobFilters.location = { contains: jobLocation, mode: "insensitive" };
    if (jobActive !== null) jobFilters.isActive = jobActive === "true";
    if (jobSearch) {
      jobFilters.OR = [
        { title: { contains: jobSearch, mode: "insensitive" } },
        { description: { contains: jobSearch, mode: "insensitive" } },
      ];
    }

    // Build include object
    const includeQuery: any = {
      _count: {
        select: { teachers: true },
      },
    };

    if (includeJobs) {
      includeQuery.jobs = {
        where: Object.keys(jobFilters).length > 0 ? jobFilters : undefined,
        orderBy: { createdAt: "desc" },
      };
      includeQuery._count.select.jobs = true;
    }

    const companies = await db.company.findMany({
      include: includeQuery,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await db.company.count();

    return NextResponse.json({
      companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

// POST /api/companies - Create company
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const company = await db.company.create({
      data: body,
      include: {
        _count: {
          select: { teachers: true },
        },
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
}
