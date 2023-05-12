/*
  Warnings:

  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Note` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_userId_fkey";

-- DropForeignKey
ALTER TABLE "Password" DROP CONSTRAINT "Password_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "creationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isAdmin" BOOLEAN DEFAULT false,
ADD COLUMN     "isWaitress" BOOLEAN DEFAULT false,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "orderId" TEXT,
ADD COLUMN     "paid" DECIMAL(65,30),
ADD COLUMN     "restaurantId" TEXT,
ADD COLUMN     "tip" DECIMAL(65,30),
ADD COLUMN     "total" DECIMAL(65,30),
ALTER COLUMN "email" DROP NOT NULL;

-- DropTable
DROP TABLE "Note";

-- CreateTable
CREATE TABLE "Restaurant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ppt_image" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "wifi" TEXT,
    "wifipwd" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "twitter" TEXT,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "extraAddress" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "rating_quantity" INTEGER,
    "cuisine" TEXT NOT NULL,
    "restaurantId" INTEGER NOT NULL,
    "open" INTEGER,
    "close" INTEGER NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Table" (
    "id" TEXT NOT NULL,
    "table_number" INTEGER NOT NULL,
    "order_in_progress" BOOLEAN NOT NULL,
    "branchId" TEXT NOT NULL,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "type" TEXT,
    "currency" TEXT,
    "branchId" TEXT NOT NULL,
    "personalizeMenu" BOOLEAN DEFAULT false,
    "image" TEXT,
    "showingHoursId" TEXT,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShowingHours" (
    "id" TEXT NOT NULL,
    "fromHour" INTEGER,
    "fromMinute" INTEGER,
    "toHour" INTEGER,
    "toMinute" INTEGER,
    "allDay" BOOLEAN NOT NULL,

    CONSTRAINT "ShowingHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,

    CONSTRAINT "MenuCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "available" BOOLEAN NOT NULL,
    "menuCategoryId" TEXT,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "tip" DECIMAL(65,30),
    "paid" BOOLEAN,
    "total" DECIMAL(65,30),
    "creationDate" TIMESTAMP(3) NOT NULL,
    "orderedDate" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN,
    "tableId" TEXT,
    "branchId" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "creationDate" TEXT,
    "quantity" INTEGER NOT NULL,
    "orderId" TEXT,
    "menuItemId" TEXT,
    "comments" TEXT,
    "paid" BOOLEAN,
    "stock" INTEGER,
    "feedbackId" TEXT,
    "userId" TEXT,
    "activeOnOrder" BOOLEAN,
    "rating" TEXT,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modifiers" (
    "id" TEXT NOT NULL,
    "type" TEXT,
    "mandatorySelected" BOOLEAN,
    "onlyOne" BOOLEAN,
    "multiSelect" BOOLEAN,
    "mandatoryOneMultiSelect" BOOLEAN,
    "extraPrice" DECIMAL(65,30),
    "modifierGroupId" TEXT,
    "cartItemId" TEXT,

    CONSTRAINT "Modifiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModifierGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "minSelectionAllowed" INTEGER,
    "maxSelectionAllowed" INTEGER,
    "isMandatory" BOOLEAN,
    "cartItemId" TEXT,

    CONSTRAINT "ModifierGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "email" TEXT NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "report" TEXT NOT NULL,
    "creationDate" TEXT,
    "orderedDate" TIMESTAMP(3),
    "tableId" TEXT,
    "branchId" TEXT,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RestaurantToUser" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_MenuItemToModifierGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CartItemToModifiers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_EmployeeToTable" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_EmployeeToFeedback" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_tableId_key" ON "Order"("tableId");

-- CreateIndex
CREATE UNIQUE INDEX "_RestaurantToUser_AB_unique" ON "_RestaurantToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RestaurantToUser_B_index" ON "_RestaurantToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MenuItemToModifierGroup_AB_unique" ON "_MenuItemToModifierGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_MenuItemToModifierGroup_B_index" ON "_MenuItemToModifierGroup"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CartItemToModifiers_AB_unique" ON "_CartItemToModifiers"("A", "B");

-- CreateIndex
CREATE INDEX "_CartItemToModifiers_B_index" ON "_CartItemToModifiers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EmployeeToTable_AB_unique" ON "_EmployeeToTable"("A", "B");

-- CreateIndex
CREATE INDEX "_EmployeeToTable_B_index" ON "_EmployeeToTable"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EmployeeToFeedback_AB_unique" ON "_EmployeeToFeedback"("A", "B");

-- CreateIndex
CREATE INDEX "_EmployeeToFeedback_B_index" ON "_EmployeeToFeedback"("B");

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_showingHoursId_fkey" FOREIGN KEY ("showingHoursId") REFERENCES "ShowingHours"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuCategory" ADD CONSTRAINT "MenuCategory_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_menuCategoryId_fkey" FOREIGN KEY ("menuCategoryId") REFERENCES "MenuCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modifiers" ADD CONSTRAINT "Modifiers_modifierGroupId_fkey" FOREIGN KEY ("modifierGroupId") REFERENCES "ModifierGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Password" ADD CONSTRAINT "Password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RestaurantToUser" ADD CONSTRAINT "_RestaurantToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RestaurantToUser" ADD CONSTRAINT "_RestaurantToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuItemToModifierGroup" ADD CONSTRAINT "_MenuItemToModifierGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuItemToModifierGroup" ADD CONSTRAINT "_MenuItemToModifierGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "ModifierGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartItemToModifiers" ADD CONSTRAINT "_CartItemToModifiers_A_fkey" FOREIGN KEY ("A") REFERENCES "CartItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartItemToModifiers" ADD CONSTRAINT "_CartItemToModifiers_B_fkey" FOREIGN KEY ("B") REFERENCES "Modifiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToTable" ADD CONSTRAINT "_EmployeeToTable_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToTable" ADD CONSTRAINT "_EmployeeToTable_B_fkey" FOREIGN KEY ("B") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToFeedback" ADD CONSTRAINT "_EmployeeToFeedback_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToFeedback" ADD CONSTRAINT "_EmployeeToFeedback_B_fkey" FOREIGN KEY ("B") REFERENCES "Feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;
