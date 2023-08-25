-- CreateEnum
CREATE TYPE "StatusMethod" AS ENUM ('pending', 'accepted', 'rejected', 'received');

-- CreateEnum
CREATE TYPE "NotificationMethod" AS ENUM ('email', 'sms', 'push', 'whatsapp');

-- CreateTable
CREATE TABLE "Notifications" (
    "id" TEXT NOT NULL,
    "method" "NotificationMethod" NOT NULL,
    "recipient" TEXT,
    "sender" TEXT,
    "status" "StatusMethod" NOT NULL,
    "message" TEXT NOT NULL,
    "branchId" TEXT,
    "userId" TEXT,
    "employeeId" TEXT,
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
