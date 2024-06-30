// app/api/reset-password/route.ts

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/utils/prisma";

export async function POST(req: NextRequest) {
  const { username, newPassword } = await req.json();

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const user = await prisma.user.update({
    where: { username },
    data: { password: hashedPassword },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Reset password failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Password reset successful" });
}
