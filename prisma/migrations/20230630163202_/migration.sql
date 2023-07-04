-- AlterTable
ALTER TABLE "MenuCategory" ADD COLUMN     "accountId" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "descriptionTranslations" JSONB,
ADD COLUMN     "nameTranslations" JSONB;

-- AlterTable
ALTER TABLE "Table" ADD COLUMN     "floorId" TEXT,
ADD COLUMN     "seats" INTEGER;

-- CreateTable
CREATE TABLE "Availabilities" (
    "id" TEXT NOT NULL,
    "dayOfWeek" TEXT,
    "startTime" TEXT,
    "endTime" TEXT,
    "menuCategoryId" TEXT,

    CONSTRAINT "Availabilities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Availabilities" ADD CONSTRAINT "Availabilities_menuCategoryId_fkey" FOREIGN KEY ("menuCategoryId") REFERENCES "MenuCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
