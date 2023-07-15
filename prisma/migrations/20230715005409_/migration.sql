/*
  Warnings:

  - You are about to drop the column `storeTimeZone` on the `Branch` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Branch" DROP COLUMN "storeTimeZone",
ADD COLUMN     "coordinates" JSONB,
ADD COLUMN     "timezone" TEXT;
