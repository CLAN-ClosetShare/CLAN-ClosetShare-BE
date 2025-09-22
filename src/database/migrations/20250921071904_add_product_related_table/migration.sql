-- CreateEnum
CREATE TYPE "public"."PRODUCT_TYPE" AS ENUM ('SALE', 'RENT');

-- CreateEnum
CREATE TYPE "public"."PRODUCT_PRICING_STATUS" AS ENUM ('INACTIVE', 'ACTIVE');

-- CreateEnum
CREATE TYPE "public"."PRODUCT_STATUS" AS ENUM ('INACTIVE', 'ACTIVE');

-- CreateEnum
CREATE TYPE "public"."FILTER_STATUS" AS ENUM ('INACTIVE', 'ACTIVE');

-- CreateTable
CREATE TABLE "public"."products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "shopId" TEXT NOT NULL,
    "status" "public"."PRODUCT_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."variants" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "public"."PRODUCT_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "image_urls" TEXT[],

    CONSTRAINT "variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_pricings" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "status" "public"."PRODUCT_PRICING_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_pricings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."filters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."FILTER_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "filters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."filter_props" (
    "id" TEXT NOT NULL,
    "filterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "public"."FILTER_STATUS" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "filter_props_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_by_filter_props" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "filterPropId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_by_filter_props_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "filters_name_key" ON "public"."filters"("name");

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."variants" ADD CONSTRAINT "variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_pricings" ADD CONSTRAINT "product_pricings_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "public"."variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."filter_props" ADD CONSTRAINT "filter_props_filterId_fkey" FOREIGN KEY ("filterId") REFERENCES "public"."filters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_by_filter_props" ADD CONSTRAINT "product_by_filter_props_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_by_filter_props" ADD CONSTRAINT "product_by_filter_props_filterPropId_fkey" FOREIGN KEY ("filterPropId") REFERENCES "public"."filter_props"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
