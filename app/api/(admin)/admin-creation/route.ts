// app/api/admin-creation/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { username, password, email } = await req.json();

  if (!username || !password || !email) {
    return NextResponse.json(
      { message: "Username, password, and email are required." },
      { status: 400 }
    );
  }

  try {
    // Check if an admin already exists to prevent re-running the script unintentionally
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "Admin" },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { message: "An admin account already exists." },
        { status: 403 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: "Admin", // Assuming 'Admin' is a valid option in your RoleEnum
      },
    });

    return NextResponse.json({
      message: "Admin user created successfully",
      admin: {
        id: newAdmin.id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to create admin user", error: error.message },
      { status: 500 }
    );
  }
}
