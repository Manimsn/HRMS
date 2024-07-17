import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { verifyToken } from "@/utils/jwt";
import { UserRole } from "@/utils/enums/UserRole";

export async function GET(req: NextRequest) {
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

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);
  const skip = (page - 1) * pageSize;

  try {
    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: pageSize,
        select: {
          id: true,
          username: true,
          lastLogin: true,
          role: true,
          createdAt: true,
          // Add more fields as needed
        },
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      users,
      page,
      pageSize,
      totalPages: Math.ceil(totalUsers / pageSize),
      totalUsers,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching users" },
      { status: 500 }
    );
  }
}
