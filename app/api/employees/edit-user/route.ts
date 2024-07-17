import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/utils/prisma";
import { verifyToken } from "@/utils/jwt";
import { UserRole } from "@/utils/enums/UserRole";

export async function PUT(req: NextRequest) {
  const { userId, username, password, role } = await req.json();

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

  // Check if the user is an admin
  if (user.role !== UserRole.Admin) {
    return NextResponse.json(
      { message: "You don't have privilege to access this content." },
      { status: 403 }
    );
  }

  const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        password: hashedPassword,
        role,
      },
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "User not found", error },
      { status: 404 }
    );
  }
}
