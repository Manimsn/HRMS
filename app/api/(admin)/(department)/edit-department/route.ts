import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  branchUpdatesSchema,
  departmentUpdatesSchema,
} from "@/utils/schemas/branchSchema";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const parsedBody = await req.json();
  let validationResult;
  let tableName = parsedBody.type.toLowerCase();

  switch (parsedBody.type) {
    case "Branch":
      validationResult = branchUpdatesSchema.safeParse(parsedBody.updates);
      break;
    case "Department":
      validationResult = departmentUpdatesSchema.safeParse(parsedBody.updates);
      break;
    default:
      return NextResponse.json(
        { message: "Invalid type specified" },
        { status: 400 }
      );
  }

  if (!validationResult.success) {
    return NextResponse.json(
      {
        message: "Validation failed",
        err: validationResult.error,
        errors: validationResult.error.flatten(),
      },
      { status: 400 }
    );
  }

  const updates = validationResult.data;
  console.log(updates);

  const ids = updates.map((update) => update.id);
  console.log(ids);

  const whereClause = {
    where: {
      id: { in: ids },
    },
    select: { id: true, name: true }, // Only fetch the id
  };
  let brancheOrDepartments;
  if (parsedBody.type == "Branch") {
    brancheOrDepartments = await prisma.branch.findMany(whereClause);
  } else {
    brancheOrDepartments = await prisma.department.findMany(whereClause);
  }
  console.log("branches", brancheOrDepartments);
  const validIds = new Set(brancheOrDepartments.map((item) => item.id));
  console.log("validIds", validIds);
  const invalidIds = ids.filter((id) => !validIds.has(id));
  console.log("invalidIds", invalidIds);
  if (invalidIds.length > 0) {
    return NextResponse.json(
      {
        message: "Invalid user IDs provided",
        invalidIds: invalidIds,
      },
      { status: 400 }
    );
  }

  try {
    const updateResults = await Promise.all(
      updates.map((update) => {
        switch (parsedBody.type) {
          case "Branch":
            return prisma.branch.update({
              where: { id: update.id },
              data: update,
            });
          case "Department":
            return prisma.department.update({
              where: { id: update.id },
              data: update,
            });
        }
      })
    );

    return NextResponse.json(
      {
        message: "Updates successful",
        results: updateResults,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Failed to update entities",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
