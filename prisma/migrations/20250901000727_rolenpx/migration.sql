/*
  Warnings:

  - Added the required column `receiverEmail` to the `Escrow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Escrow` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EscrowRole" AS ENUM ('SELLER', 'BUYER');

-- AlterTable
ALTER TABLE "Escrow" ADD COLUMN     "receiverEmail" TEXT NOT NULL,
ADD COLUMN     "role" "EscrowRole" NOT NULL;
