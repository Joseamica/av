-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'card', 'debitCard', 'paypal', 'applePay', 'other');

-- CreateTable
CREATE TABLE "Payments" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" "PaymentMethod" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "tip" DECIMAL(65,30),
    "total" DECIMAL(65,30),
    "branchId" TEXT,
    "orderId" TEXT,
    "userId" TEXT,

    CONSTRAINT "Payments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
