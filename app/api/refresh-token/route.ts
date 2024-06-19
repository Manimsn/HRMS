// app/api/refresh-token/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyToken, generateAccessToken } from "@/utils/jwt";

export async function POST(req: NextRequest) {
  const { refreshToken } = await req.json();

  if (!refreshToken) {
    return NextResponse.json(
      { message: "Refresh token is required" },
      { status: 400 }
    );
  }

  const user: any = verifyToken(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET!
  );

  if (!user) {
    return NextResponse.json(
      { message: "Invalid refresh token" },
      { status: 403 }
    );
  }

  const accessToken = generateAccessToken({
    id: user.id,
    username: user.username,
    role: user.role,
  });

  return NextResponse.json({ accessToken });
}
