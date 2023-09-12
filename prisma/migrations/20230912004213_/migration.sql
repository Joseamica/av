/*
  Warnings:

  - You are about to drop the column `adminId` on the `Availabilities` table. All the data in the column will be lost.
  - You are about to drop the column `adminId` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `close` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `coordinates` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `open` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `rating_quantity` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `restaurantId` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `wifipwd` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `adminId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `adminId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `adminId` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `adminId` on the `Menu` table. All the data in the column will be lost.
  - You are about to drop the column `allday` on the `Menu` table. All the data in the column will be lost.
  - You are about to drop the column `fromHour` on the `Menu` table. All the data in the column will be lost.
  - You are about to drop the column `toHour` on the `Menu` table. All the data in the column will be lost.
  - You are about to drop the column `adminId` on the `MenuCategory` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `MenuCategory` table. All the data in the column will be lost.
  - You are about to drop the column `adminId` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `adminId` on the `ModifierGroup` table. All the data in the column will be lost.
  - You are about to drop the column `adminId` on the `Modifiers` table. All the data in the column will be lost.
  - You are about to drop the column `adminId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `adminId` on the `Payments` table. All the data in the column will be lost.
  - You are about to drop the column `adminId` on the `Table` table. All the data in the column will be lost.
  - You are about to drop the column `adminId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Restaurant` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `Branch` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `role` on the `Employee` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EmployeeRoles" AS ENUM ('manager', 'waiter');

-- DropForeignKey
ALTER TABLE "Availabilities" DROP CONSTRAINT "Availabilities_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Menu" DROP CONSTRAINT "Menu_adminId_fkey";

-- DropForeignKey
ALTER TABLE "MenuCategory" DROP CONSTRAINT "MenuCategory_adminId_fkey";

-- DropForeignKey
ALTER TABLE "MenuCategory" DROP CONSTRAINT "MenuCategory_branchId_fkey";

-- DropForeignKey
ALTER TABLE "MenuItem" DROP CONSTRAINT "MenuItem_adminId_fkey";

-- DropForeignKey
ALTER TABLE "MenuItem" DROP CONSTRAINT "MenuItem_branchId_fkey";

-- DropForeignKey
ALTER TABLE "ModifierGroup" DROP CONSTRAINT "ModifierGroup_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Modifiers" DROP CONSTRAINT "Modifiers_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Payments" DROP CONSTRAINT "Payments_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Table" DROP CONSTRAINT "Table_adminId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_adminId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_restaurantId_fkey";

-- AlterTable
ALTER TABLE "Availabilities" DROP COLUMN "adminId",
ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "Branch" DROP COLUMN "adminId",
DROP COLUMN "close",
DROP COLUMN "coordinates",
DROP COLUMN "open",
DROP COLUMN "rating",
DROP COLUMN "rating_quantity",
DROP COLUMN "restaurantId",
DROP COLUMN "wifipwd",
ADD COLUMN     "chainId" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "managerIds" TEXT[],
ADD COLUMN     "wifiPwd" TEXT;

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "adminId";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "adminId",
DROP COLUMN "role",
ADD COLUMN     "role" "EmployeeRoles" NOT NULL;

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "adminId";

-- AlterTable
ALTER TABLE "Menu" DROP COLUMN "adminId",
DROP COLUMN "allday",
DROP COLUMN "fromHour",
DROP COLUMN "toHour";

-- AlterTable
ALTER TABLE "MenuCategory" DROP COLUMN "adminId",
DROP COLUMN "branchId";

-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "adminId",
DROP COLUMN "branchId";

-- AlterTable
ALTER TABLE "ModifierGroup" DROP COLUMN "adminId";

-- AlterTable
ALTER TABLE "Modifiers" DROP COLUMN "adminId";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "adminId";

-- AlterTable
ALTER TABLE "Payments" DROP COLUMN "adminId";

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "employeeId" TEXT;

-- AlterTable
ALTER TABLE "Table" DROP COLUMN "adminId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "adminId",
DROP COLUMN "role";

-- DropTable
DROP TABLE "Admin";

-- DropTable
DROP TABLE "Restaurant";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "Chain" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moderatorIds" TEXT[],

    CONSTRAINT "Chain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_id_key" ON "Role"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_id_key" ON "Permission"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_RoleToUser_AB_unique" ON "_RoleToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionToRole_AB_unique" ON "_PermissionToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_email_key" ON "Branch"("email");

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availabilities" ADD CONSTRAINT "Availabilities_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
