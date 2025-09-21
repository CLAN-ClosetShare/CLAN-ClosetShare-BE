-- CreateEnum
CREATE TYPE "public"."SHOP_STATUS" AS ENUM ('UNVERIFIED', 'VERIFIED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."SHOP_ROLE" AS ENUM ('STAFF', 'OWNER');

-- CreateEnum
CREATE TYPE "public"."SHOP_STAFF_STATUS" AS ENUM ('ACTIVE', 'REMOVED');

-- CreateTable
CREATE TABLE "public"."shops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "phone_number" TEXT,
    "email" TEXT,
    "avatar_url" TEXT,
    "background_url" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "public"."SHOP_STATUS" NOT NULL DEFAULT 'UNVERIFIED',

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shop_staffs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "role" "public"."SHOP_ROLE" NOT NULL DEFAULT 'STAFF',
    "status" "public"."SHOP_STAFF_STATUS" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "shop_staffs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."shop_staffs" ADD CONSTRAINT "shop_staffs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shop_staffs" ADD CONSTRAINT "shop_staffs_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
