/*
  Warnings:

  - You are about to drop the column `menuCategoryId` on the `Availabilities` table. All the data in the column will be lost.
  - You are about to drop the column `menuCategoryId` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the `MenuCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MenuToMenuCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Availabilities" DROP CONSTRAINT "Availabilities_menuCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "MenuItem" DROP CONSTRAINT "MenuItem_menuCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "_MenuToMenuCategory" DROP CONSTRAINT "_MenuToMenuCategory_A_fkey";

-- DropForeignKey
ALTER TABLE "_MenuToMenuCategory" DROP CONSTRAINT "_MenuToMenuCategory_B_fkey";

-- AlterTable
ALTER TABLE "Availabilities" DROP COLUMN "menuCategoryId",
ADD COLUMN     "categoryId" TEXT;

-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "menuCategoryId",
ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "categoryId" TEXT;

-- AlterTable
ALTER TABLE "ModifierGroup" ALTER COLUMN "multiMax" SET DEFAULT 1;

-- DropTable
DROP TABLE "MenuCategory";

-- DropTable
DROP TABLE "_MenuToMenuCategory";

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "description" TEXT,
    "pdf" BOOLEAN DEFAULT false,
    "branchId" TEXT,
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductModifier" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "quantity" INTEGER DEFAULT 0,
    "plu" TEXT,
    "extraPrice" DECIMAL(65,30),
    "total" DECIMAL(65,30),
    "cartItemId" TEXT,
    "branchId" TEXT,

    CONSTRAINT "ProductModifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryToMenu" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductModifier_plu_key" ON "ProductModifier"("plu");

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToMenu_AB_unique" ON "_CategoryToMenu"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryToMenu_B_index" ON "_CategoryToMenu"("B");

-- AddForeignKey
ALTER TABLE "Availabilities" ADD CONSTRAINT "Availabilities_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductModifier" ADD CONSTRAINT "ProductModifier_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "CartItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductModifier" ADD CONSTRAINT "ProductModifier_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToMenu" ADD CONSTRAINT "_CategoryToMenu_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToMenu" ADD CONSTRAINT "_CategoryToMenu_B_fkey" FOREIGN KEY ("B") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
