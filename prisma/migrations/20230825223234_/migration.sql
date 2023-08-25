/*
  Warnings:

  - You are about to drop the column `employeeId` on the `Notifications` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notifications" DROP CONSTRAINT "Notifications_employeeId_fkey";

-- AlterTable
ALTER TABLE "Notifications" DROP COLUMN "employeeId";

-- CreateTable
CREATE TABLE "_EmployeeToNotifications" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_EmployeeToNotifications_AB_unique" ON "_EmployeeToNotifications"("A", "B");

-- CreateIndex
CREATE INDEX "_EmployeeToNotifications_B_index" ON "_EmployeeToNotifications"("B");

-- AddForeignKey
ALTER TABLE "_EmployeeToNotifications" ADD CONSTRAINT "_EmployeeToNotifications_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToNotifications" ADD CONSTRAINT "_EmployeeToNotifications_B_fkey" FOREIGN KEY ("B") REFERENCES "Notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
