-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'user';

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "branchId" TEXT;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
