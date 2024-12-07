/*
  Warnings:

  - You are about to drop the column `orderId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `ratingId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `ticketId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `order_DetailsId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `Organizer` table. All the data in the column will be lost.
  - You are about to drop the column `order_DetailsId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `ratingId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `userCouponId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `userPointId` on the `User` table. All the data in the column will be lost.
  - Added the required column `expiredAt` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_ratingId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_order_DetailsId_fkey";

-- DropForeignKey
ALTER TABLE "Organizer" DROP CONSTRAINT "Organizer_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_order_DetailsId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_orderId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_ratingId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_userCouponId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_userPointId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "orderId",
DROP COLUMN "ratingId",
DROP COLUMN "ticketId",
ADD COLUMN     "organizerId" TEXT;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "order_DetailsId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "eventId" INTEGER,
ADD COLUMN     "expiredAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "redirect_url" TEXT,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Order_Details" ADD COLUMN     "orderId" INTEGER,
ADD COLUMN     "ticketId" INTEGER;

-- AlterTable
ALTER TABLE "Organizer" DROP COLUMN "eventId";

-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "eventId" INTEGER,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "order_DetailsId",
ADD COLUMN     "eventId" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "orderId",
DROP COLUMN "ratingId",
DROP COLUMN "role",
DROP COLUMN "userCouponId",
DROP COLUMN "userPointId";

-- AlterTable
ALTER TABLE "UserCoupon" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "UserPoint" ADD COLUMN     "userId" TEXT,
ALTER COLUMN "point" SET DEFAULT 10000;

-- DropEnum
DROP TYPE "Role";

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organizer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCoupon" ADD CONSTRAINT "UserCoupon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPoint" ADD CONSTRAINT "UserPoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order_Details" ADD CONSTRAINT "Order_Details_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order_Details" ADD CONSTRAINT "Order_Details_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
