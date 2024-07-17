import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { verifyToken } from "@/utils/jwt";
import { UserRole } from "@/utils/enums/UserRole";

export async function DELETE(req: NextRequest) {
  const { userIds } = await req.json();

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json({ message: "Invalid user IDs" }, { status: 400 });
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { message: "Authorization header missing" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const user: any = verifyToken(token, process.env.ACCESS_TOKEN_SECRET!);

    if (!user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 403 });
    }
    console.log(user.role)

    // Check if the user is an admin
    if (user.role !== UserRole.Admin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const deleteResult = await prisma.branch.deleteMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });

    if (deleteResult.count === 0) {
      return NextResponse.json({ message: "Users not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: `${deleteResult.count} users deleted successfully`,
    });
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
