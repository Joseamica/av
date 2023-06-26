-- AlterTable
ALTER TABLE "Branch" ALTER COLUMN "fourthPaymentMethod" SET DEFAULT 'apple_pay';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paidDate" TIMESTAMP(3);
