/*
  Warnings:

  - You are about to drop the column `tariff` on the `connections` table. All the data in the column will be lost.
  - Added the required column `tariff_rate` to the `connections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tariff_type` to the `connections` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "connections" DROP COLUMN "tariff",
ADD COLUMN     "tariff_rate" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "tariff_type" TEXT NOT NULL;
