/*
  Warnings:

  - You are about to drop the column `recipient` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `sender` on the `Notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "recipient",
DROP COLUMN "sender",
ADD COLUMN     "type" TEXT;
