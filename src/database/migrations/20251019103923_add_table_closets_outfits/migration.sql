-- CreateEnum
CREATE TYPE "public"."CLOSET_ITEM_TYPE" AS ENUM ('TOPS', 'OUTWEAR', 'BOTTOMS', 'ACCESSORIES');

-- CreateTable
CREATE TABLE "public"."closet_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."CLOSET_ITEM_TYPE" NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "closet_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."outfits" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "top_id" TEXT,
    "outwear_id" TEXT,
    "bottom_id" TEXT,

    CONSTRAINT "outfits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_OutfitAccessories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OutfitAccessories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_OutfitAccessories_B_index" ON "public"."_OutfitAccessories"("B");

-- AddForeignKey
ALTER TABLE "public"."closet_items" ADD CONSTRAINT "closet_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."outfits" ADD CONSTRAINT "outfits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."outfits" ADD CONSTRAINT "outfits_top_id_fkey" FOREIGN KEY ("top_id") REFERENCES "public"."closet_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."outfits" ADD CONSTRAINT "outfits_outwear_id_fkey" FOREIGN KEY ("outwear_id") REFERENCES "public"."closet_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."outfits" ADD CONSTRAINT "outfits_bottom_id_fkey" FOREIGN KEY ("bottom_id") REFERENCES "public"."closet_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_OutfitAccessories" ADD CONSTRAINT "_OutfitAccessories_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."closet_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_OutfitAccessories" ADD CONSTRAINT "_OutfitAccessories_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."outfits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
