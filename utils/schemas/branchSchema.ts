// schemas/branchSchema.ts
import { z } from "zod";
import { DesignationEnum, UserRole } from "../enums/UserRole";

// export const createBranchSchema = z.object({
//   branchName: z.string().min(1, "Branch name is required"),
//   stateId: z.number().int("State ID must be an integer"),
//   regionId: z.number().int("Region ID must be an integer"),
// });

export const branchSchema = z.object({
  branchName: z.string().min(1, "Branch name is required"),
  stateId: z.number().int("State ID must be an integer"),
  regionId: z.number().int("Region ID must be an integer"),
});

export const createBranchesSchema = z.array(branchSchema);

export const createStateSchema = z.object({
  states: z.array(
    z.object({
      name: z.string().min(1, "State name is required"),
    })
  ),
});

export const createDepartmentSchema = z.object({
  departments: z
    .array(
      z.object({
        name: z.string().min(1, "Department name is required"),
        isCorporate: z.boolean(),
      })
    )
    .min(1, "At least one department must be provided"), // Ensure non-empty array
});

export const createUserSchema = z.object({
  users: z.array(
    z.object({
      username: z.string().min(1, "Username is required"),
      email: z.string().email("Invalid email format").optional(),
      password: z
        .string()
        .min(6, "Password must be at least 6 characters long"),
      role: z.nativeEnum(UserRole),
      branchId: z.number().optional(),
      regionId: z.number().optional(),
      departmentId: z.number().optional(),
      designation: z.nativeEnum(DesignationEnum).optional(),
      reportsToId: z.number().optional(),
    })
  ),
});
