// app/api/routes/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/utils/jwt"; // Adjust this path to your JWT utility function
import { UserRole } from "@/utils/enums/UserRole";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { regions } = await req.json();

  if (!Array.isArray(regions) || regions.length === 0) {
    return NextResponse.json(
      { message: "At least one region name is required" },
      { status: 400 }
    );
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { message: "Authorization header missing" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];
  const user: any = verifyToken(token, process.env.ACCESS_TOKEN_SECRET!);

  if (!user || user.role !== UserRole.Admin) {
    return NextResponse.json({
      message: "Forbidden - Only admins can create regions",
      status: 403,
    });
  }

  try {
    const createdRegions = await prisma.$transaction(
      regions.map((region) =>
        prisma.region.create({
          data: {
            name: region.name,
          },
        })
      )
    );

    return NextResponse.json({
      message: `${createdRegions.length} regions created successfully`,
      regions: createdRegions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to create regions", error: error.message },
      { status: 500 }
    );
  }
}
