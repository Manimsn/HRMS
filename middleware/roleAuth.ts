// middleware/roleAuth.ts

import { NextResponse } from "next/server";
import { verifyToken } from "../utils/jwt";

export function roleAuth(requiredRole: string) {
  return async function (req: any, res: any, next: any) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header missing" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const user: any = verifyToken(token, process.env.ACCESS_TOKEN_SECRET!);

    if (!user || user.role !== requiredRole) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    req.user = user;
    next();
  };
}
