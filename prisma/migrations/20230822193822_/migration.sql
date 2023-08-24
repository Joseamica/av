/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `MenuCategory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MenuCategory" DROP COLUMN "imageUrl",
ADD COLUMN     "image" TEXT;
