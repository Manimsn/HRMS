// app/api/create-states/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/utils/jwt";
import { createStateSchema } from "@/utils/schemas/branchSchema"; // Assuming the correct schema import
import { UserRole } from "@/utils/enums/UserRole";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const result = createStateSchema.safeParse(await req.json());
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
    return NextResponse.json(
      { message: "Forbidden - Only admins can create states" },
      { status: 403 }
    );
  }

  try {
    const { states } = result.data;
    const createdStates = await prisma.state.createMany({
      data: states.map((state: any) => ({
        name: state.name,
      })),
      skipDuplicates: true, // Avoid creating duplicate states
    });

    return NextResponse.json(
      {
        message: `${createdStates.count} states created successfully`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to create state(s)", error: error.message },
      { status: 500 }
    );
  }
}
