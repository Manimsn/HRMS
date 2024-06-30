// app/api/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/utils/prisma";
import { generateAccessToken, generateRefreshToken } from "@/utils/jwt";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Invalid username or password" },
      { status: 401 }
    );
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return NextResponse.json(
      { message: "Invalid username or password" },
      { status: 401 }
    );
  }

  const accessToken = generateAccessToken({
    id: user.id,
    username: user.username,
    role: user.role,
  });
  const refreshToken = generateRefreshToken({
    id: user.id,
    username: user.username,
    role: user.role,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  return NextResponse.json({ accessToken, refreshToken });
}
