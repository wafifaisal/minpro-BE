-- CreateEnum
CREATE TYPE "RatingRange" AS ENUM ('1', '2', '3', '4', '5');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "coupon_seat" INTEGER;

-- CreateTable
CREATE TABLE "Review" (
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "rating" "RatingRange" NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("userId","eventId")
);

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
