-- AlterTable
ALTER TABLE "Menu" ADD COLUMN     "allday" BOOLEAN,
ADD COLUMN     "fromHour" DECIMAL(65,30),
ADD COLUMN     "toHour" DECIMAL(65,30);
