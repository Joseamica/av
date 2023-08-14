-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "adminId" TEXT;

-- AlterTable
ALTER TABLE "MenuCategory" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "Table" ALTER COLUMN "order_in_progress" SET DEFAULT false;

-- AddForeignKey
ALTER TABLE "MenuCategory" ADD CONSTRAINT "MenuCategory_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
