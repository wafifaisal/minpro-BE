/*
  Warnings:

  - You are about to alter the column `total_price` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `final_price` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "total_price" SET DATA TYPE INTEGER,
ALTER COLUMN "final_price" SET DATA TYPE INTEGER;
