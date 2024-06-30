// app/routes/api/entities.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { parseStringFilters } from "@/utils/utils";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  // Generate filters from query parameters
  const filters = parseStringFilters(url.searchParams);

  try {
    let data, count;

    const queryOptions = {
      skip,
      take: limit,
      where: filters,
    };

    switch (type) {
      case "branch":
        data = await prisma.branch.findMany({
          ...queryOptions,
          include: { state: true, region: true, manager: true },
        });
        count = await prisma.branch.count({ where: filters });
        break;
      case "department":
        data = await prisma.department.findMany(queryOptions);
        count = await prisma.department.count({ where: filters });
        break;
      case "state":
        data = await prisma.state.findMany({
          ...queryOptions,
          include: { branches: true },
        });
        count = await prisma.state.count({ where: filters });
        break;
      case "region":
        data = await prisma.region.findMany({
          ...queryOptions,
          include: { branches: true, head: true },
        });
        count = await prisma.region.count({ where: filters });
        break;
      default:
        return NextResponse.json(
          {
            message:
              "Invalid type specified. Valid types are: branch, department, state, region.",
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      type,
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch data", error: error.message },
      { status: 500 }
    );
  }
}
