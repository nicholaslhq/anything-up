/*
  Warnings:

  - Added the required column `updatedAt` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "VoteType" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
