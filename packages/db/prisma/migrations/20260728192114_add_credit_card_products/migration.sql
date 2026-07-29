-- CreateEnum
CREATE TYPE "CreditCardProposalStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "credit_card_products" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "brand_color" TEXT NOT NULL,
    "logo_url" TEXT NOT NULL,
    "card_image_url" TEXT NOT NULL,
    "fee" DECIMAL(10,2) NOT NULL,
    "perks" JSONB NOT NULL,
    "tips" TEXT NOT NULL,
    "rate_groceries" DECIMAL(6,4) NOT NULL,
    "rate_dining" DECIMAL(6,4) NOT NULL,
    "rate_recurring" DECIMAL(6,4) NOT NULL,
    "rate_other" DECIMAL(6,4) NOT NULL,
    "signup_bonus" TEXT NOT NULL,
    "referral_url" TEXT,
    "source_url" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_card_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_card_change_proposals" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "status" "CreditCardProposalStatus" NOT NULL DEFAULT 'pending',
    "field_changes" JSONB NOT NULL,
    "scraped_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMPTZ,
    "review_note" TEXT,

    CONSTRAINT "credit_card_change_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "credit_card_products_slug_key" ON "credit_card_products"("slug");

-- CreateIndex
CREATE INDEX "credit_card_change_proposals_product_id_idx" ON "credit_card_change_proposals"("product_id");

-- CreateIndex
CREATE INDEX "credit_card_change_proposals_status_idx" ON "credit_card_change_proposals"("status");

-- AddForeignKey
ALTER TABLE "credit_card_change_proposals" ADD CONSTRAINT "credit_card_change_proposals_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "credit_card_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
