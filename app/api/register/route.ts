// app/api/register/routes.ts (Assuming Next.js v14 App Router)

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/utils/prisma";
import { verifyToken } from "@/utils/jwt";

export async function POST(req: NextRequest) {
  const { users } = await req.json();

  if (!Array.isArray(users) || users.length === 0) {
    return NextResponse.json(
      { message: "Invalid users data" },
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
  const adminUser: any = verifyToken(token, process.env.ACCESS_TOKEN_SECRET!);

  if (!adminUser) {
    return NextResponse.json({ message: "Invalid token" }, { status: 403 });
  }

  if (adminUser.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const createdUsers = [];
    for (const newUser of users) {
      const { username, password, role, email, branchId } = newUser;

      // Check for existing username
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUsername) {
        return NextResponse.json({
          message: `The username '${username}' is already taken.`,
          status: 400,
        });
      }

      // Check for existing email
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        return NextResponse.json({
          message: `The email '${email}' is already in use.`,
          status: 400,
        });
      }

      // Validate branchId if provided
      const branchExists = await prisma.branch.findUnique({
        where: { id: parseInt(branchId, 10) },
      });
      if (!branchExists) {
        return NextResponse.json({
          message: `Branch ID ${branchId} does not exist`,
          status: 400,
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const createdUser = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role,
          branchId: parseInt(branchId, 10),
        },
      });

      createdUsers.push({
        id: createdUser.id,
        username: createdUser.username,
        email: createdUser.email,
        role: createdUser.role,
        branchId: createdUser.branchId,
      });
    }

    return NextResponse.json({
      message: `${createdUsers.length} users registered successfully`,
      users: createdUsers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Registration failed", error: error.message },
      { status: 500 }
    );
  }
}
