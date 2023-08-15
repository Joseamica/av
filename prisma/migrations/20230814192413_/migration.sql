/*
  Warnings:

  - You are about to drop the column `userId` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the `_AdminToBranch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AdminToOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AdminToRestaurant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AdminToTable` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_userId_fkey";

-- DropForeignKey
ALTER TABLE "_AdminToBranch" DROP CONSTRAINT "_AdminToBranch_A_fkey";

-- DropForeignKey
ALTER TABLE "_AdminToBranch" DROP CONSTRAINT "_AdminToBranch_B_fkey";

-- DropForeignKey
ALTER TABLE "_AdminToOrder" DROP CONSTRAINT "_AdminToOrder_A_fkey";

-- DropForeignKey
ALTER TABLE "_AdminToOrder" DROP CONSTRAINT "_AdminToOrder_B_fkey";

-- DropForeignKey
ALTER TABLE "_AdminToRestaurant" DROP CONSTRAINT "_AdminToRestaurant_A_fkey";

-- DropForeignKey
ALTER TABLE "_AdminToRestaurant" DROP CONSTRAINT "_AdminToRestaurant_B_fkey";

-- DropForeignKey
ALTER TABLE "_AdminToTable" DROP CONSTRAINT "_AdminToTable_A_fkey";

-- DropForeignKey
ALTER TABLE "_AdminToTable" DROP CONSTRAINT "_AdminToTable_B_fkey";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "userId",
ALTER COLUMN "id" SET DEFAULT 'cllb3d9b90003cedclcthud41';

-- AlterTable
ALTER TABLE "Availabilities" ADD COLUMN     "adminId" TEXT;

-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "adminId" TEXT DEFAULT 'cllb3d9b90003cedclcthud41';

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "adminId" TEXT;

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "adminId" TEXT;

-- AlterTable
ALTER TABLE "Menu" ADD COLUMN     "adminId" TEXT;

-- AlterTable
ALTER TABLE "MenuCategory" ADD COLUMN     "adminId" TEXT;

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "adminId" TEXT;

-- AlterTable
ALTER TABLE "ModifierGroup" ADD COLUMN     "adminId" TEXT;

-- AlterTable
ALTER TABLE "Modifiers" ADD COLUMN     "adminId" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "adminId" TEXT;

-- AlterTable
ALTER TABLE "Payments" ADD COLUMN     "adminId" TEXT;

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "adminId" TEXT;

-- AlterTable
ALTER TABLE "Table" ADD COLUMN     "adminId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adminId" TEXT;

-- DropTable
DROP TABLE "_AdminToBranch";

-- DropTable
DROP TABLE "_AdminToOrder";

-- DropTable
DROP TABLE "_AdminToRestaurant";

-- DropTable
DROP TABLE "_AdminToTable";

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availabilities" ADD CONSTRAINT "Availabilities_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuCategory" ADD CONSTRAINT "MenuCategory_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modifiers" ADD CONSTRAINT "Modifiers_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModifierGroup" ADD CONSTRAINT "ModifierGroup_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
