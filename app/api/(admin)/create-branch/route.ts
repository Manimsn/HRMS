// app/api/create-branch/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/utils/jwt";
import { createBranchesSchema } from "@/utils/schemas/branchSchema";
import { UserRole } from "@/utils/enums/UserRole";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Parse and validate the request body
    const result = createBranchesSchema.safeParse(await req.json());

    if (!result.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: result.error.flatten() },
        { status: 400 }
      );
    }

    const branches = result.data;
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header missing" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const user: any = verifyToken(token, process.env.ACCESS_TOKEN_SECRET!);

    if (user.role !== UserRole.Admin) {
      return NextResponse.json({
        message: "Forbidden - Only admins can create branches",
        status: 403,
      });
    }

    const stateIds = branches.map((branch: any) => branch.stateId);
    const regionIds = branches.map((branch: any) => branch.regionId);

    const [states, regions] = await Promise.all([
      prisma.state.findMany({ where: { id: { in: stateIds } } }),
      prisma.region.findMany({ where: { id: { in: regionIds } } }),
    ]);

    const stateMap = new Map(states.map((state) => [state.id, state]));
    const regionMap = new Map(regions.map((region) => [region.id, region]));

    const newBranches = [];
    for (const branch of branches) {
      if (!stateMap.has(branch.stateId) || !regionMap.has(branch.regionId)) {
        return NextResponse.json({
          message: "State or region ID does not exist",
          status: 404,
        });
      }
      const newBranch = await prisma.branch.create({
        data: {
          name: branch.branchName,
          stateId: branch.stateId,
          regionId: branch.regionId,
        },
      });
      newBranches.push(newBranch);
    }

    return NextResponse.json(
      { message: "Branches created successfully", branches: newBranches },
      { status: 201 }
    );
  } catch (error: any) {
    if (
      error.message === "Token has expired" ||
      error.message === "Invalid token"
    ) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Failed to create branches", error: error.message },
      { status: 500 }
    );
  }
}
