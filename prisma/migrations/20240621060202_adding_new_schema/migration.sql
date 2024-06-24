-- CreateEnum
CREATE TYPE "DesignationEnum" AS ENUM ('Trainee', 'Executive', 'AssistantManager', 'Manager', 'SeniorManager', 'ChiefManager', 'AssistantGeneralManager', 'GeneralManager', 'ChiefTechnologyOfficer', 'ChiefDevelopmentOfficer', 'ManagingDirector');

-- AlterTable: Add new columns as optional initially
ALTER TABLE "Branch" ADD COLUMN "regionId" INTEGER;

ALTER TABLE "User" ADD COLUMN "departmentId" INTEGER;
ALTER TABLE "User" ADD COLUMN "designation" "DesignationEnum";
ALTER TABLE "User" ADD COLUMN "regionId" INTEGER;
ALTER TABLE "User" ADD COLUMN "reportsToId" INTEGER;

-- CreateTable
CREATE TABLE "Region" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "headId" INTEGER,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isCorporate" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BranchHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3),

    CONSTRAINT "BranchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignationHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "designation" "DesignationEnum" NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3),

    CONSTRAINT "DesignationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepartmentHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3),

    CONSTRAINT "DepartmentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Region_headId_key" ON "Region"("headId");

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Region" ADD CONSTRAINT "Region_headId_fkey" FOREIGN KEY ("headId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_reportsToId_fkey" FOREIGN KEY ("reportsToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchHistory" ADD CONSTRAINT "BranchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchHistory" ADD CONSTRAINT "BranchHistory_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignationHistory" ADD CONSTRAINT "DesignationHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentHistory" ADD CONSTRAINT "DepartmentHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentHistory" ADD CONSTRAINT "DepartmentHistory_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Set default values for the new columns (if necessary)
UPDATE "Branch" SET "regionId" = 1 WHERE "regionId" IS NULL; -- Replace '1' with an appropriate default value or handle accordingly
UPDATE "User" SET "designation" = 'Trainee' WHERE "designation" IS NULL; -- Replace 'Trainee' with an appropriate default value or handle accordingly

-- Alter the columns to make them required
ALTER TABLE "Branch" ALTER COLUMN "regionId" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "designation" SET NOT NULL;
