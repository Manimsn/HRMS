// app/api/create-designation/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/utils/jwt";
import { createDepartmentSchema } from "@/utils/schemas/branchSchema";
import { UserRole } from "@/utils/enums/UserRole";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const result = createDepartmentSchema.safeParse(await req.json());
  if (!result.success) {
    return NextResponse.json(
      { message: "Validation failed", errors: result.error.flatten() },
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
  let user: any;
  try {
    user = verifyToken(token, process.env.ACCESS_TOKEN_SECRET!);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 403 });
  }

  if (user.role !== UserRole.Admin) {
    return NextResponse.json({
      message: "Forbidden - Only admins can create departments",
      status: 403,
    });
  }

  try {
    const { departments } = result.data;
    const createdDepartments = await prisma.department.createMany({
      data: departments.map((department) => ({
        name: department.name,
        isCorporate: department.isCorporate,
      })),
      skipDuplicates: true, // Avoid creating duplicate entries
    });

    return NextResponse.json(
      {
        message: `${createdDepartments.count} departments created successfully`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to create departments", error: error.message },
      { status: 500 }
    );
  }
}
