// app/api/protected/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { roleAuth } from "@/middleware/roleAuth";

// export const middleware = roleAuth("admin");

// export async function GET(req: NextRequest) {
//   return NextResponse.json({ message: "Protected content" });
// }

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { message: "Authorization header missing" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];
  const user = verifyToken(token, process.env.ACCESS_TOKEN_SECRET!);

  if (!user) {
    return NextResponse.json({ message: "Invalid token" }, { status: 403 });
  }

  return NextResponse.json({
    message: "Access granted to protected resource",
    user,
  });
}
