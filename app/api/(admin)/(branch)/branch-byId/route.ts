import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { entityQuerySchema } from "@/utils/schemas/branchSchema";
import { EntityType } from "@/utils/enums/UserRole";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Validate query parameters using the Zod schema
  const validationResult = entityQuerySchema.safeParse({
    type: searchParams.get("type"),
    id: searchParams.get("id"),
  });

  if (!validationResult.success) {
    return NextResponse.json(
      {
        message: "Invalid query parameters",
        errors: validationResult.error.format(),
      },
      { status: 400 }
    );
  }

  const { type, id } = validationResult.data;

  try {
    let entity;

    switch (type) {
      case EntityType.Branch:
        entity = await prisma.branch.findUnique({
          where: { id },
          include: { state: true, region: true, manager: true },
        });
        break;
      case EntityType.Department:
        entity = await prisma.department.findUnique({
          where: { id },
        });
        break;
      case EntityType.State:
        entity = await prisma.state.findUnique({
          where: { id },
          include: { branches: true },
        });
        break;
      case EntityType.Region:
        entity = await prisma.region.findUnique({
          where: { id },
          include: { branches: true, head: true },
        });
        break;
      default:
        return NextResponse.json(
          {
            message: "Invalid entity type provided.",
          },
          { status: 400 }
        );
    }

    if (!entity) {
      return NextResponse.json(
        {
          message: `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } with ID ${id} not found.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(entity);
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Failed to fetch the entity.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
