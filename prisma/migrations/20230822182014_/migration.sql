/*
  Warnings:

  - You are about to drop the column `ppt_image` on the `Branch` table. All the data in the column will be lost.
  - Added the required column `image` to the `Branch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Branch" DROP COLUMN "ppt_image",
ADD COLUMN     "image" TEXT NOT NULL,
ALTER COLUMN "social" SET DATA TYPE TEXT[];
