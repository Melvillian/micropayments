/*
  Warnings:

  - The `permitV` column on the `PaymentChannel2` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `microPaymentMessageV` column on the `PaymentChannel2` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "PaymentChannel2" ADD COLUMN     "amount" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "permitV",
ADD COLUMN     "permitV" INTEGER,
DROP COLUMN "microPaymentMessageV",
ADD COLUMN     "microPaymentMessageV" INTEGER;
