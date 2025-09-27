/*
  Warnings:

  - You are about to drop the column `payment_link_id` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `status` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."TRANSACTION_STATUS" AS ENUM ('PENDING', 'CANCELLED', 'UNDERPAID', 'PAID', 'EXPIRED', 'PROCESSING', 'FAILED');

-- AlterTable
ALTER TABLE "public"."Transaction" DROP COLUMN "payment_link_id",
ADD COLUMN     "status" "public"."TRANSACTION_STATUS" NOT NULL;
