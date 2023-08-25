/*
  Warnings:

  - The required column `id` was added to the `Password` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Password" ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "employeeId" DROP NOT NULL,
ADD CONSTRAINT "Password_pkey" PRIMARY KEY ("id");
