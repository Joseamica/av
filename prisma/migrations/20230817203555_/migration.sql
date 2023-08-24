/*
  Warnings:

  - You are about to drop the column `menuId` on the `MenuCategory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MenuCategory" DROP CONSTRAINT "MenuCategory_menuId_fkey";

-- AlterTable
ALTER TABLE "Availabilities" ALTER COLUMN "menuId" DROP NOT NULL,
ALTER COLUMN "adminId" SET DEFAULT 'cllb3d9b90003cedclcthud41';

-- AlterTable
ALTER TABLE "CartItem" ALTER COLUMN "adminId" SET DEFAULT 'cllb3d9b90003cedclcthud41';

-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "adminId" SET DEFAULT 'cllb3d9b90003cedclcthud41';

-- AlterTable
ALTER TABLE "Feedback" ALTER COLUMN "adminId" SET DEFAULT 'cllb3d9b90003cedclcthud41';

-- AlterTable
ALTER TABLE "Menu" ALTER COLUMN "adminId" SET DEFAULT 'cllb3d9b90003cedclcthud41';

-- AlterTable
ALTER TABLE "MenuCategory" DROP COLUMN "menuId",
ALTER COLUMN "adminId" SET DEFAULT 'cllb3d9b90003cedclcthud41';

-- AlterTable
ALTER TABLE "MenuItem" ALTER COLUMN "adminId" SET DEFAULT 'cllb3d9b90003cedclcthud41';

-- AlterTable
ALTER TABLE "ModifierGroup" ALTER COLUMN "adminId" SET DEFAULT 'cllb3d9b90003cedclcthud41';

-- AlterTable
ALTER TABLE "Modifiers" ALTER COLUMN "adminId" SET DEFAULT 'cllb3d9b90003cedclcthud41';

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "adminId" SET DEFAULT 'cllb3d9b90003cedclcthud41';

-- AlterTable
ALTER TABLE "Payments" ALTER COLUMN "adminId" SET DEFAULT 'cllb3d9b90003cedclcthud41';

-- AlterTable
ALTER TABLE "Restaurant" ALTER COLUMN "adminId" SET DEFAULT 'cllb3d9b90003cedclcthud41';

-- AlterTable
ALTER TABLE "Table" ALTER COLUMN "adminId" SET DEFAULT 'cllb3d9b90003cedclcthud41';

-- CreateTable
CREATE TABLE "_MenuToMenuCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_MenuToMenuCategory_AB_unique" ON "_MenuToMenuCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_MenuToMenuCategory_B_index" ON "_MenuToMenuCategory"("B");

-- AddForeignKey
ALTER TABLE "_MenuToMenuCategory" ADD CONSTRAINT "_MenuToMenuCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuToMenuCategory" ADD CONSTRAINT "_MenuToMenuCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "MenuCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
