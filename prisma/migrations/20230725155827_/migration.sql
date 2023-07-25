/*
  Warnings:

  - You are about to drop the column `facebook` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `firstPaymentMethod` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `firstTip` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `fourthPaymentMethod` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `instagram` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `secondPaymentMethod` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `secondTip` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `thirdPaymentMethod` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `thirdTip` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `twitter` on the `Branch` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Branch" DROP COLUMN "facebook",
DROP COLUMN "firstPaymentMethod",
DROP COLUMN "firstTip",
DROP COLUMN "fourthPaymentMethod",
DROP COLUMN "instagram",
DROP COLUMN "secondPaymentMethod",
DROP COLUMN "secondTip",
DROP COLUMN "thirdPaymentMethod",
DROP COLUMN "thirdTip",
DROP COLUMN "twitter",
ADD COLUMN     "language" TEXT DEFAULT 'en',
ADD COLUMN     "paymentMethods" TEXT[] DEFAULT ARRAY['cash', 'card']::TEXT[],
ADD COLUMN     "social" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "tipsPercentages" DECIMAL(65,30)[] DEFAULT ARRAY[10, 12, 15]::DECIMAL(65,30)[];
