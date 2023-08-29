/*
  Warnings:

  - You are about to drop the `Notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EmployeeToNotifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notifications" DROP CONSTRAINT "Notifications_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Notifications" DROP CONSTRAINT "Notifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "_EmployeeToNotifications" DROP CONSTRAINT "_EmployeeToNotifications_A_fkey";

-- DropForeignKey
ALTER TABLE "_EmployeeToNotifications" DROP CONSTRAINT "_EmployeeToNotifications_B_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "image" TEXT,
ADD COLUMN     "phone" TEXT;

-- DropTable
DROP TABLE "Notifications";

-- DropTable
DROP TABLE "_EmployeeToNotifications";

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "method" "NotificationMethod" NOT NULL,
    "recipient" TEXT,
    "sender" TEXT,
    "status" "StatusMethod" NOT NULL,
    "message" TEXT NOT NULL,
    "branchId" TEXT,
    "userId" TEXT,
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EmployeeToNotification" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_EmployeeToNotification_AB_unique" ON "_EmployeeToNotification"("A", "B");

-- CreateIndex
CREATE INDEX "_EmployeeToNotification_B_index" ON "_EmployeeToNotification"("B");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToNotification" ADD CONSTRAINT "_EmployeeToNotification_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToNotification" ADD CONSTRAINT "_EmployeeToNotification_B_fkey" FOREIGN KEY ("B") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
