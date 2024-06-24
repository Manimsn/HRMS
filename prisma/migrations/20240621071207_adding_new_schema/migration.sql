/*
  Warnings:

  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RoleEnum" AS ENUM ('SuperAdmin', 'Admin', 'User');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "RoleEnum" NOT NULL,
ALTER COLUMN "designation" DROP NOT NULL;
