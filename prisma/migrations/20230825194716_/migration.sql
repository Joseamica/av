/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[employeeId]` on the table `Password` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `employeeId` to the `Password` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Password" ADD COLUMN     "employeeId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Password_employeeId_key" ON "Password"("employeeId");

-- AddForeignKey
ALTER TABLE "Password" ADD CONSTRAINT "Password_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
