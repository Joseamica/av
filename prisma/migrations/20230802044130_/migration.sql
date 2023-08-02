/*
  Warnings:

  - You are about to drop the column `descriptionTranslations` on the `MenuCategory` table. All the data in the column will be lost.
  - You are about to drop the column `nameTranslations` on the `MenuCategory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MenuCategory" DROP COLUMN "descriptionTranslations",
DROP COLUMN "nameTranslations",
ADD COLUMN     "pdf" BOOLEAN DEFAULT false;
