-- CreateTable
CREATE TABLE "approved_holdings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "symbol" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approved_holdings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "approved_holdings_user_id_idx" ON "approved_holdings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "approved_holdings_user_id_symbol_key" ON "approved_holdings"("user_id", "symbol");

-- AddForeignKey
ALTER TABLE "approved_holdings" ADD CONSTRAINT "approved_holdings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
