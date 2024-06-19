// app/api/create-branch/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/utils/jwt"; // Ensure this utility function is correctly implemented to verify JWTs

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { branchName, stateId } = await req.json();

  if (!branchName || !stateId) {
    return NextResponse.json(
      { message: "Both branch name and state ID are required" },
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

  if (!user || user.role !== "admin") {
    return NextResponse.json({
      message: "Forbidden or invalid token",
      status: user ? 403 : 401,
    });
  }

  // Check if the stateId exists in the database
  const stateExists = await prisma.state.findUnique({
    where: { id: parseInt(stateId, 10) },
  });

  if (!stateExists) {
    return NextResponse.json(
      { message: "The provided state ID does not exist in the database" },
      { status: 404 }
    );
  }

  // Attempt to create a branch
  try {
    const newBranch = await prisma.branch.create({
      data: {
        name: branchName,
        stateId: parseInt(stateId, 10), // Ensure stateId is an integer
      },
    });

    return NextResponse.json({
      message: "Branch created successfully",
      branch: {
        id: newBranch.id,
        name: newBranch.name,
        stateId: newBranch.stateId,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to create branch", error: error.message },
      { status: 500 }
    );
  }
}
