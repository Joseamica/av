/*
  Warnings:

  - The `dayOfWeek` column on the `Availabilities` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `restaurantId` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `restaurantId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Restaurant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RestaurantToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "_RestaurantToUser" DROP CONSTRAINT "_RestaurantToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_RestaurantToUser" DROP CONSTRAINT "_RestaurantToUser_B_fkey";

-- AlterTable
ALTER TABLE "Availabilities" DROP COLUMN "dayOfWeek",
ADD COLUMN     "dayOfWeek" INTEGER;

-- AlterTable
ALTER TABLE "Branch" DROP COLUMN "restaurantId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "restaurantId";

-- DropTable
DROP TABLE "Restaurant";

-- DropTable
DROP TABLE "_RestaurantToUser";
