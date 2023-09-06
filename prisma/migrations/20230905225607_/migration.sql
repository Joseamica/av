/*
  Warnings:

  - You are about to drop the column `isMandatory` on the `ModifierGroup` table. All the data in the column will be lost.
  - You are about to drop the column `maxSelectionAllowed` on the `ModifierGroup` table. All the data in the column will be lost.
  - You are about to drop the column `minSelectionAllowed` on the `ModifierGroup` table. All the data in the column will be lost.
  - You are about to drop the column `nameTranslations` on the `ModifierGroup` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `ModifierGroup` table. All the data in the column will be lost.
  - You are about to drop the column `mandatoryOneMultiSelect` on the `Modifiers` table. All the data in the column will be lost.
  - You are about to drop the column `mandatorySelected` on the `Modifiers` table. All the data in the column will be lost.
  - You are about to drop the column `multiSelect` on the `Modifiers` table. All the data in the column will be lost.
  - You are about to drop the column `onlyOne` on the `Modifiers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[plu]` on the table `ModifierGroup` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[plu]` on the table `Modifiers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "StatusMethod" ADD VALUE 'completed';

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "productType" INTEGER;

-- AlterTable
ALTER TABLE "ModifierGroup" DROP COLUMN "isMandatory",
DROP COLUMN "maxSelectionAllowed",
DROP COLUMN "minSelectionAllowed",
DROP COLUMN "nameTranslations",
DROP COLUMN "type",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ALTER COLUMN "max" SET DEFAULT 0,
ALTER COLUMN "min" SET DEFAULT 0,
ALTER COLUMN "multiMax" SET DEFAULT 0,
ALTER COLUMN "multiply" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Modifiers" DROP COLUMN "mandatoryOneMultiSelect",
DROP COLUMN "mandatorySelected",
DROP COLUMN "multiSelect",
DROP COLUMN "onlyOne",
ADD COLUMN     "max" INTEGER DEFAULT 0,
ADD COLUMN     "min" INTEGER DEFAULT 0,
ADD COLUMN     "multiply" INTEGER DEFAULT 0,
ADD COLUMN     "plu" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ModifierGroup_plu_key" ON "ModifierGroup"("plu");

-- CreateIndex
CREATE UNIQUE INDEX "Modifiers_plu_key" ON "Modifiers"("plu");
