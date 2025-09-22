/*
  Warnings:

  - You are about to drop the column `avatar_url` on the `shops` table. All the data in the column will be lost.
  - You are about to drop the column `background_url` on the `shops` table. All the data in the column will be lost.
  - You are about to drop the column `avatar_url` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `image_urls` on the `variants` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."shops" DROP COLUMN "avatar_url",
DROP COLUMN "background_url",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "background" TEXT;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "avatar_url",
ADD COLUMN     "avatar" TEXT;

-- AlterTable
ALTER TABLE "public"."variants" DROP COLUMN "image_urls",
ADD COLUMN     "images" TEXT[];
