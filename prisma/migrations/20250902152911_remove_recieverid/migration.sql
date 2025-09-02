-- DropForeignKey
ALTER TABLE "Escrow" DROP CONSTRAINT "Escrow_receiverId_fkey";

-- AlterTable
ALTER TABLE "Escrow" ALTER COLUMN "receiverId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Escrow" ADD CONSTRAINT "Escrow_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
