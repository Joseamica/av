-- AlterTable
ALTER TABLE "ModifierGroup" ADD COLUMN     "max" INTEGER,
ADD COLUMN     "min" INTEGER,
ADD COLUMN     "multiMax" INTEGER,
ADD COLUMN     "multiply" INTEGER,
ADD COLUMN     "nameTranslations" JSONB,
ADD COLUMN     "plu" TEXT;
