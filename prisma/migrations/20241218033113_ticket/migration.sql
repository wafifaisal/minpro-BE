/*
  Warnings:

  - Added the required column `end_date` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Made the column `end_time` on table `Ticket` required. This step will fail if there are existing NULL values in that column.
  - Made the column `start_time` on table `Ticket` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "end_date" DATE NOT NULL,
ADD COLUMN     "start_date" DATE NOT NULL,
ALTER COLUMN "end_time" SET NOT NULL,
ALTER COLUMN "end_time" SET DATA TYPE TIME,
ALTER COLUMN "start_time" SET NOT NULL,
ALTER COLUMN "start_time" SET DATA TYPE TIME;
