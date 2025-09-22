/*
  Warnings:

  - You are about to drop the column `filterId` on the `filter_props` table. All the data in the column will be lost.
  - You are about to drop the column `filterPropId` on the `product_by_filter_props` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `product_by_filter_props` table. All the data in the column will be lost.
  - You are about to drop the column `variantId` on the `product_pricings` table. All the data in the column will be lost.
  - You are about to drop the column `shopId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `shopId` on the `shop_staffs` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `shop_staffs` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `variants` table. All the data in the column will be lost.
  - Added the required column `filter_id` to the `filter_props` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filter_prop_id` to the `product_by_filter_props` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `product_by_filter_props` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variant_id` to the `product_pricings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shop_id` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shop_id` to the `shop_staffs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `shop_staffs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `variants` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."filter_props" DROP CONSTRAINT "filter_props_filterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_by_filter_props" DROP CONSTRAINT "product_by_filter_props_filterPropId_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_by_filter_props" DROP CONSTRAINT "product_by_filter_props_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_pricings" DROP CONSTRAINT "product_pricings_variantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."products" DROP CONSTRAINT "products_shopId_fkey";

-- DropForeignKey
ALTER TABLE "public"."sessions" DROP CONSTRAINT "sessions_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."shop_staffs" DROP CONSTRAINT "shop_staffs_shopId_fkey";

-- DropForeignKey
ALTER TABLE "public"."shop_staffs" DROP CONSTRAINT "shop_staffs_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."variants" DROP CONSTRAINT "variants_productId_fkey";

-- AlterTable
ALTER TABLE "public"."filter_props" DROP COLUMN "filterId",
ADD COLUMN     "filter_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."product_by_filter_props" DROP COLUMN "filterPropId",
DROP COLUMN "productId",
ADD COLUMN     "filter_prop_id" TEXT NOT NULL,
ADD COLUMN     "product_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."product_pricings" DROP COLUMN "variantId",
ADD COLUMN     "variant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."products" DROP COLUMN "shopId",
ADD COLUMN     "shop_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."sessions" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."shop_staffs" DROP COLUMN "shopId",
DROP COLUMN "userId",
ADD COLUMN     "shop_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."variants" DROP COLUMN "productId",
ADD COLUMN     "product_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shop_staffs" ADD CONSTRAINT "shop_staffs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shop_staffs" ADD CONSTRAINT "shop_staffs_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."variants" ADD CONSTRAINT "variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_pricings" ADD CONSTRAINT "product_pricings_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."filter_props" ADD CONSTRAINT "filter_props_filter_id_fkey" FOREIGN KEY ("filter_id") REFERENCES "public"."filters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_by_filter_props" ADD CONSTRAINT "product_by_filter_props_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_by_filter_props" ADD CONSTRAINT "product_by_filter_props_filter_prop_id_fkey" FOREIGN KEY ("filter_prop_id") REFERENCES "public"."filter_props"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
