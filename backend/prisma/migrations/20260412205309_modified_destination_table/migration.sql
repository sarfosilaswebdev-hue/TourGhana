/*
  Warnings:

  - Added the required column `rating` to the `Destination` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Destination" ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "tags" TEXT[];
