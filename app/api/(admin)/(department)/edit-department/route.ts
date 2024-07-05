import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  branchUpdateSchema,
  departmentUpdateSchema,
} from "@/utils/schemas/branchSchema";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const parsedBody = await req.json();

  // Start by validating the type first
  const typeSchema = z.object({
    type: z.enum(["Branch", "Department"]),
  });
  const typeValidation = typeSchema.safeParse(parsedBody);

  if (!typeValidation.success) {
    return NextResponse.json(
      {
        message: "Validation failed for type",
        errors: typeValidation.error.flatten(),
      },
      { status: 400 }
    );
  }

  // Now handle based on type
  const { type } = typeValidation.data;
  let schema;
  if (type === "Branch") {
    schema = branchUpdateSchema;
  } else if (type === "Department") {
    schema = departmentUpdateSchema;
  }

  const dataValidation = schema?.safeParse(parsedBody.data);
  console.log(dataValidation?.error)

  if (!dataValidation?.success) {
    return NextResponse.json(
      {
        message: "Validation failed for data",
        errors: dataValidation?.error.flatten(),
      },
      { status: 400 }
    );
  }

  try {
    let updateResult;
    switch (type) {
      case "Branch":
        updateResult = await prisma.branch.update({
          where: { id: dataValidation.data.id },
          data: dataValidation.data,
        });
        break;
      case "Department":
        updateResult = await prisma.department.update({
          where: { id: dataValidation.data.id },
          data: dataValidation.data,
        });
        break;
      default:
        return NextResponse.json(
          { message: "Invalid update type" },
          { status: 400 }
        );
    }

    return NextResponse.json(
      {
        message: "Update successful",
        result: updateResult,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Failed to update",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
