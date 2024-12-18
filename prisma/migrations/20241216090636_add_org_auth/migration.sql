/*
  Warnings:

  - You are about to drop the column `name` on the `Organizer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[organizer_name]` on the table `Organizer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organizer_name` to the `Organizer` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Organizer_name_key";

-- AlterTable
ALTER TABLE "Organizer" DROP COLUMN "name",
ADD COLUMN     "organizer_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Organizer_organizer_name_key" ON "Organizer"("organizer_name");
