/*
  Warnings:

  - A unique constraint covering the columns `[orderCode]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "orderCode" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderCode_key" ON "public"."orders"("orderCode");
