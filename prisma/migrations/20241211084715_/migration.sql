/*
  Warnings:

  - You are about to alter the column `price` on the `Ticket` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - Made the column `price` on table `Ticket` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Ticket" ALTER COLUMN "price" SET NOT NULL,
ALTER COLUMN "price" SET DATA TYPE INTEGER;
