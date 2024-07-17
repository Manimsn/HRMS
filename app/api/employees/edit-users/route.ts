// app/api/edit-branch.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { userUpdateSchema } from "@/utils/schemas/branchSchema";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const parsedBody = await req.json();
  const result = userUpdateSchema.safeParse(parsedBody);

  if (!result.success) {
    const detailedErrors = result.error.flatten();
    // Enhance the error structure to be more informative
    const enhancedErrors =
      detailedErrors.fieldErrors.updates?.map((errors, index) => ({
        index,
        errors,
      })) || [];
    return new Response(
      JSON.stringify({
        message: "Validation failed",
        errors: result.error.flatten(),
        enhancedErrors,
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const { updates } = result.data;

  // Validate IDs
  const ids = updates.map((update) => update.id);
  const users = await prisma.user.findMany({
    where: {
      id: { in: ids },
    },
    select: { id: true }, // Only fetch the id
  });
  const validIds = new Set(users.map((user) => user.id));

  const invalidIds = ids.filter((id) => !validIds.has(id));
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
      updates.map(async (update) => {
        // Validate foreign keys before updating
        const validationErrors = await validateForeignKeys(update);
        if (validationErrors.length > 0) {
          return { id: update.id, errors: validationErrors };
        }

        return prisma.user.update({
          where: { id: update.id },
          data: update,
          select: {
            id: true,
            username: true,
            email: true,
            branchId: true,
            departmentId: true,
            designation: true,
            regionId: true,
            reportsToId: true,
            role: true,
          },
        });
      })
    );

    const errors = updateResults.filter((result: any) => result.errors);
    if (errors.length > 0) {
      return new Response(
        JSON.stringify({
          message: "Validation failed for some entries",
          errors,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Users updated successfully",
        results: updateResults.filter((result: any) => !result.errors),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: "Failed to update users",
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

async function validateForeignKeys(update: any) {
  const errors = [];
  if (update.branchId) {
    const branchExists = await prisma.branch.findUnique({
      where: { id: update.branchId },
    });
    if (!branchExists)
      errors.push(`Branch ID ${update.branchId} does not exist.`);
  }
  if (update.departmentId) {
    const departmentExists = await prisma.department.findUnique({
      where: { id: update.departmentId },
    });
    if (!departmentExists)
      errors.push(`Department ID ${update.departmentId} does not exist.`);
  }
  if (update.regionId) {
    const regionExists = await prisma.region.findUnique({
      where: { id: update.regionId },
    });
    if (!regionExists)
      errors.push(`Region ID ${update.regionId} does not exist.`);
  }
  if (update.reportsToId) {
    const reportsToExists = await prisma.user.findUnique({
      where: { id: update.reportsToId },
    });
    if (!reportsToExists)
      errors.push(`ReportsTo ID ${update.reportsToId} does not exist.`);
  }
  return errors;
}
