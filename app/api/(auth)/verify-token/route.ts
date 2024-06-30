import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  try {
    const user = verifyToken(token, process.env.ACCESS_TOKEN_SECRET!);
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
