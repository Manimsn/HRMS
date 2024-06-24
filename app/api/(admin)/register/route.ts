// app/api/register/routes.ts (Assuming Next.js v14 App Router)

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/utils/jwt";
import { createUserSchema } from "@/utils/schemas/branchSchema";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const result = createUserSchema.safeParse(await req.json());
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
  let userContext: any;
  try {
    userContext = verifyToken(token, process.env.ACCESS_TOKEN_SECRET!);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 403 });
  }

  // Check for existence of department, region, and branch
  const idsToCheck = result.data.users.map((user) => ({
    departmentId: user.departmentId,
    regionId: user.regionId,
    branchId: user.branchId,
  }));

  try {
    for (const id of idsToCheck) {
      if (
        id.departmentId &&
        !(await prisma.department.findUnique({
          where: { id: id.departmentId },
        }))
      ) {
        return NextResponse.json({
          message: `Department ID ${id.departmentId} does not exist`,
          status: 404,
        });
      }
      if (
        id.regionId &&
        !(await prisma.region.findUnique({ where: { id: id.regionId } }))
      ) {
        return NextResponse.json({
          message: `Region ID ${id.regionId} does not exist`,
          status: 404,
        });
      }
      if (
        id.branchId &&
        !(await prisma.branch.findUnique({ where: { id: id.branchId } }))
      ) {
        return NextResponse.json({
          message: `Branch ID ${id.branchId} does not exist`,
          status: 404,
        });
      }
    }

    const createdUsers = await prisma.user.createMany({
      data: result.data.users.map((user) => ({
        ...user,
        password: bcrypt.hashSync(user.password, 10),
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({
      message: `${createdUsers.count} users created successfully`,
      status: 201,
    });
  } catch (error: any) {
    return NextResponse.json({
      message: "Failed to create users",
      error: error.message,
      status: 500,
    });
  }
}
