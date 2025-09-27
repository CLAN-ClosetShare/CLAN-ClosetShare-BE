/*
  Warnings:

  - You are about to drop the column `orderCode` on the `orders` table. All the data in the column will be lost.
  - You are about to alter the column `order_code` on the `subscription_orders` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - A unique constraint covering the columns `[order_code]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order_code]` on the table `subscription_orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order_code` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Made the column `order_code` on table `subscription_orders` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."orders_orderCode_key";

-- AlterTable
ALTER TABLE "public"."orders" DROP COLUMN "orderCode",
ADD COLUMN     "order_code" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."subscription_orders" ALTER COLUMN "order_code" SET NOT NULL,
ALTER COLUMN "order_code" SET DATA TYPE INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_code_key" ON "public"."orders"("order_code");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_orders_order_code_key" ON "public"."subscription_orders"("order_code");
