-- CreateEnum
CREATE TYPE "public"."TRANSACTION_TYPE" AS ENUM ('PAYIN', 'PAYOUT');

-- CreateEnum
CREATE TYPE "public"."SUBSCRIPTION_ORDER_STATUS" AS ENUM ('PENDING', 'PAID', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."SUBSCRIPTION_PLAN_STATUS" AS ENUM ('INACTIVE', 'ACTIVE');

-- CreateEnum
CREATE TYPE "public"."USER_SUBSCRIPTION_STATUS" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELED');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "subscription_plan_end_date" TIMESTAMP(3),
ADD COLUMN     "subscription_plan_id" TEXT,
ADD COLUMN     "subscription_plan_start_date" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "public"."SUBSCRIPTION_PLAN_STATUS" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscription_orders" (
    "id" TEXT NOT NULL,
    "subscription_plan_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "payment_method" "public"."PAYMENT_METHOD" NOT NULL DEFAULT 'BANK_TRANSFER',
    "status" "public"."SUBSCRIPTION_ORDER_STATUS" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Transaction" (
    "id" TEXT NOT NULL,
    "payment_link_id" TEXT NOT NULL,
    "ammount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "type" "public"."TRANSACTION_TYPE" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "order_id" TEXT,
    "subscription_order_id" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_UserSubscriptionPlan" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserSubscriptionPlan_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserSubscriptionPlan_B_index" ON "public"."_UserSubscriptionPlan"("B");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_subscription_plan_id_fkey" FOREIGN KEY ("subscription_plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_subscription_order_id_fkey" FOREIGN KEY ("subscription_order_id") REFERENCES "public"."subscription_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserSubscriptionPlan" ADD CONSTRAINT "_UserSubscriptionPlan_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."subscription_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserSubscriptionPlan" ADD CONSTRAINT "_UserSubscriptionPlan_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
