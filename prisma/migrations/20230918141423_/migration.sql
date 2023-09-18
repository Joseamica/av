/*
  Warnings:

  - You are about to drop the column `menuItemId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the `MenuItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MenuItemToModifierGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_menuItemId_fkey";

-- DropForeignKey
ALTER TABLE "MenuItem" DROP CONSTRAINT "MenuItem_branchId_fkey";

-- DropForeignKey
ALTER TABLE "MenuItem" DROP CONSTRAINT "MenuItem_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "_MenuItemToModifierGroup" DROP CONSTRAINT "_MenuItemToModifierGroup_A_fkey";

-- DropForeignKey
ALTER TABLE "_MenuItemToModifierGroup" DROP CONSTRAINT "_MenuItemToModifierGroup_B_fkey";

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "menuItemId",
ADD COLUMN     "productId" TEXT;

-- DropTable
DROP TABLE "MenuItem";

-- DropTable
DROP TABLE "_MenuItemToModifierGroup";

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "plu" TEXT,
    "image" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "productType" INTEGER,
    "available" BOOLEAN NOT NULL,
    "categoryId" TEXT,
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "branchId" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ModifierGroupToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ModifierGroupToProduct_AB_unique" ON "_ModifierGroupToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_ModifierGroupToProduct_B_index" ON "_ModifierGroupToProduct"("B");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModifierGroupToProduct" ADD CONSTRAINT "_ModifierGroupToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "ModifierGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModifierGroupToProduct" ADD CONSTRAINT "_ModifierGroupToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
