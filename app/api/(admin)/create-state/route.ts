// app/api/create-states/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/utils/jwt"; // Ensure this utility function is correctly implemented to verify JWTs

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  // Extract state name from request body
  const { stateName } = await req.json();

  if (!stateName) {
    return NextResponse.json(
      { message: "State name is required" },
      { status: 400 }
    );
  }

  // Authorization check
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { message: "Authorization header missing" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];
  const user: any = verifyToken(token, process.env.ACCESS_TOKEN_SECRET!);

  if (!user) {
    return NextResponse.json({ message: "Invalid token" }, { status: 403 });
  }

  // Admin role validation
  if (user.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // Attempt to create a state
  try {
    const newState = await prisma.state.create({
      data: {
        name: stateName,
      },
    });

    return NextResponse.json({
      message: "State created successfully",
      state: {
        id: newState.id,
        name: newState.name,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to create state", error: error.message },
      { status: 500 }
    );
  }
}
