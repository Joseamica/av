/*
  Warnings:

  - You are about to drop the column `orderedDate` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `table_number` on the `Table` table. All the data in the column will be lost.
  - Added the required column `number` to the `Table` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "orderedDate",
ADD COLUMN     "comments" TEXT;

-- AlterTable
ALTER TABLE "Table" DROP COLUMN "table_number",
ADD COLUMN     "number" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "access" INTEGER,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AdminToRestaurant" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AdminToBranch" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AdminToTable" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AdminToOrder" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AdminToRestaurant_AB_unique" ON "_AdminToRestaurant"("A", "B");

-- CreateIndex
CREATE INDEX "_AdminToRestaurant_B_index" ON "_AdminToRestaurant"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AdminToBranch_AB_unique" ON "_AdminToBranch"("A", "B");

-- CreateIndex
CREATE INDEX "_AdminToBranch_B_index" ON "_AdminToBranch"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AdminToTable_AB_unique" ON "_AdminToTable"("A", "B");

-- CreateIndex
CREATE INDEX "_AdminToTable_B_index" ON "_AdminToTable"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AdminToOrder_AB_unique" ON "_AdminToOrder"("A", "B");

-- CreateIndex
CREATE INDEX "_AdminToOrder_B_index" ON "_AdminToOrder"("B");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminToRestaurant" ADD CONSTRAINT "_AdminToRestaurant_A_fkey" FOREIGN KEY ("A") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminToRestaurant" ADD CONSTRAINT "_AdminToRestaurant_B_fkey" FOREIGN KEY ("B") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminToBranch" ADD CONSTRAINT "_AdminToBranch_A_fkey" FOREIGN KEY ("A") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminToBranch" ADD CONSTRAINT "_AdminToBranch_B_fkey" FOREIGN KEY ("B") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminToTable" ADD CONSTRAINT "_AdminToTable_A_fkey" FOREIGN KEY ("A") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminToTable" ADD CONSTRAINT "_AdminToTable_B_fkey" FOREIGN KEY ("B") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminToOrder" ADD CONSTRAINT "_AdminToOrder_A_fkey" FOREIGN KEY ("A") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminToOrder" ADD CONSTRAINT "_AdminToOrder_B_fkey" FOREIGN KEY ("B") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
