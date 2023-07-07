/*
  Warnings:

  - You are about to drop the column `timezone` on the `Branch` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[dayOfWeek,startTime,endTime,menuId]` on the table `Availabilities` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `menuId` to the `Availabilities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurantId` to the `Branch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Availabilities" ADD COLUMN     "menuId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Branch" DROP COLUMN "timezone",
ADD COLUMN     "created" TEXT,
ADD COLUMN     "restaurantId" TEXT NOT NULL,
ADD COLUMN     "updated" TEXT,
ALTER COLUMN "close" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "plu" TEXT;

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "plu" TEXT;

-- AlterTable
ALTER TABLE "Table" ADD COLUMN     "locationId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "restaurantId" TEXT;

-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "updated" TEXT,
    "created" TEXT,
    "storeTimeZone" TEXT,
    "region" TEXT,
    "logo" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "adminEmail" TEXT,
    "userId" TEXT,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deliverect" (
    "id" TEXT NOT NULL,
    "deliverectToken" TEXT,
    "deliverectExpiration" INTEGER,

    CONSTRAINT "Deliverect_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Availabilities_dayOfWeek_startTime_endTime_menuId_key" ON "Availabilities"("dayOfWeek", "startTime", "endTime", "menuId");

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availabilities" ADD CONSTRAINT "Availabilities_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
