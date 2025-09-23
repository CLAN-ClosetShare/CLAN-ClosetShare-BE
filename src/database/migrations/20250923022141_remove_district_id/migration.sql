-- CreateEnum
CREATE TYPE "public"."PAYMENT_METHOD" AS ENUM ('BANK_TRANSFER', 'COD');

-- CreateEnum
CREATE TYPE "public"."ORDER_TYPE" AS ENUM ('SALE', 'RENT');

-- CreateEnum
CREATE TYPE "public"."ORDER_STATUS" AS ENUM ('PENDING', 'DELIVERING', 'DELIVERED', 'CANCELED', 'RETURNED', 'SUCCESS');

-- CreateTable
CREATE TABLE "public"."addresses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "receiver_name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "province_id" INTEGER NOT NULL,
    "ward_id" INTEGER NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "total_value" DOUBLE PRECISION NOT NULL,
    "discount_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "final_value" DOUBLE PRECISION NOT NULL,
    "payment_method" "public"."PAYMENT_METHOD" NOT NULL,
    "type" "public"."ORDER_TYPE" NOT NULL,
    "receiver_name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "province_id" INTEGER NOT NULL,
    "ward_id" INTEGER NOT NULL,
    "status" "public"."ORDER_STATUS" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_details" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discount_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rental_start_date" TIMESTAMP(3),
    "rental_end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_details_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_details" ADD CONSTRAINT "order_details_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_details" ADD CONSTRAINT "order_details_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
