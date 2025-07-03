import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

// GET /api/companies/[companyId] - Get company by ID
export async function GET(
  request: Request,
  { params }: { params: { companyId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const includeJobs = searchParams.get("includeJobs") === "true";
    const includeTeachers = searchParams.get("includeTeachers") === "true";
    
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
        select: { 
          teachers: true,
          jobs: true,
        },
      },
    };

    if (includeJobs) {
      includeQuery.jobs = {
        where: Object.keys(jobFilters).length > 0 ? jobFilters : undefined,
        orderBy: { createdAt: "desc" },
      };
    }

    if (includeTeachers) {
      includeQuery.teachers = {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      };
    }

    const company = await db.company.findUnique({
      where: { id: params.companyId },
      include: includeQuery,
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}

// PUT /api/companies/[companyId] - Update company
export async function PUT(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to update this company
    // You might want to add additional authorization logic here
    const existingCompany = await db.company.findUnique({
      where: { id: params.companyId },
      include: {
        teachers: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Optional: Check if user is a teacher of this company
    // if (existingCompany.teachers.length === 0) {
    //   return NextResponse.json(
    //     { error: "Forbidden: You don't have permission to update this company" },
    //     { status: 403 }
    //   );
    // }

    const body = await request.json();

    const company = await db.company.update({
      where: { id: params.companyId },
      data: body,
      include: {
        _count: {
          select: { 
            teachers: true,
            jobs: true,
          },
        },
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    );
  }
}

// DELETE /api/companies/[companyId] - Delete company
export async function DELETE(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if company exists
    const existingCompany = await db.company.findUnique({
      where: { id: params.companyId },
      include: {
        teachers: {
          where: { userId: session.user.id },
        },
        _count: {
          select: {
            teachers: true,
            jobs: true,
          },
        },
      },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Optional: Prevent deletion if company has teachers or jobs
    // if (existingCompany._count.teachers > 0 || existingCompany._count.jobs > 0) {
    //   return NextResponse.json(
    //     { error: "Cannot delete company with associated teachers or jobs" },
    //     { status: 400 }
    //   );
    // }

    await db.company.delete({
      where: { id: params.companyId },
    });

    return NextResponse.json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json(
      { error: "Failed to delete company" },
      { status: 500 }
    );
  }
}