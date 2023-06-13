/*
  Warnings:

  - You are about to drop the column `wifi` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `rol` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `showingHoursId` on the `Menu` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Modifiers` table. All the data in the column will be lost.
  - The primary key for the `Restaurant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `isAdmin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isWaitress` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `ShowingHours` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `role` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'manager', 'waiter');

-- DropForeignKey
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_userId_fkey";

-- DropForeignKey
ALTER TABLE "Menu" DROP CONSTRAINT "Menu_showingHoursId_fkey";

-- DropForeignKey
ALTER TABLE "_RestaurantToUser" DROP CONSTRAINT "_RestaurantToUser_A_fkey";

-- AlterTable
ALTER TABLE "Branch" DROP COLUMN "wifi",
ADD COLUMN     "firstPaymentMethod" TEXT DEFAULT 'cash',
ADD COLUMN     "firstTip" DECIMAL(65,30) DEFAULT 10,
ADD COLUMN     "fourthPaymentMethod" TEXT DEFAULT 'apple pay',
ADD COLUMN     "secondPaymentMethod" TEXT DEFAULT 'card',
ADD COLUMN     "secondTip" DECIMAL(65,30) DEFAULT 12,
ADD COLUMN     "thirdPaymentMethod" TEXT DEFAULT 'paypal',
ADD COLUMN     "thirdTip" DECIMAL(65,30) DEFAULT 15,
ADD COLUMN     "timezone" TEXT,
ADD COLUMN     "wifiName" TEXT,
ALTER COLUMN "restaurantId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "userId",
ADD COLUMN     "image" TEXT,
ADD COLUMN     "paidBy" TEXT,
ALTER COLUMN "paid" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "rol",
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "role" "Role" NOT NULL;

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Menu" DROP COLUMN "showingHoursId";

-- AlterTable
ALTER TABLE "ModifierGroup" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'radio';

-- AlterTable
ALTER TABLE "Modifiers" DROP COLUMN "type",
ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Restaurant_id_seq";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isAdmin",
DROP COLUMN "isWaitress",
ADD COLUMN     "role" "Role",
ADD COLUMN     "tableId" TEXT;

-- AlterTable
ALTER TABLE "_RestaurantToUser" ALTER COLUMN "A" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "ShowingHours";

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CartItemToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CartItemToUser_AB_unique" ON "_CartItemToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_CartItemToUser_B_index" ON "_CartItemToUser"("B");

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RestaurantToUser" ADD CONSTRAINT "_RestaurantToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartItemToUser" ADD CONSTRAINT "_CartItemToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "CartItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartItemToUser" ADD CONSTRAINT "_CartItemToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
