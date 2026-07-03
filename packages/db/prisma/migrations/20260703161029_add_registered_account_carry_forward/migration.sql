-- AlterTable
ALTER TABLE "financial_profiles" ADD COLUMN     "fhsa_carry_forward_base" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "rrsp_known_room" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "tfsa_carry_forward_base" DECIMAL(12,2) NOT NULL DEFAULT 0;
