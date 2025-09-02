/*
  Warnings:

  - Added the required column `productName` to the `Escrow` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Escrow" ADD COLUMN     "description" TEXT,
ADD COLUMN     "productName" TEXT NOT NULL;
