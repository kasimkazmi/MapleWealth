import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Best-effort annual-fee extraction from raw page text. Bank pages don't expose structured
// data for this, so we fall back to text patterns. This is intentionally narrow in scope —
// fee is the most stable, most consistently-worded signal on these pages; rates/perks/name
// text is far too varied across issuers to regex reliably in one pass, and a wrong parse
// there is more likely to slip past a reviewer than an obviously-wrong fee number would.
function extractAnnualFee(pageText: string): number | null {
  // Matches "$120 annual fee" directly, or "Annual fee ... $120" with up to ~40 chars of
  // intervening text (parentheticals like "(for primary cardholder)" are common between the
  // label and the number). Deliberately does NOT match on bare "per year" — that phrase turns
  // up constantly on spend-cap copy ("up to $5,000 per year in category X"), which caused a
  // real false positive during testing (Simplii's spend cap read as a $5,000 fee).
  const feePatterns = [
    /\$\s?([\d,]+(?:\.\d{2})?)\s*annual\s+fee/i,
    /annual\s+fee.{0,40}?\$\s?([\d,]+(?:\.\d{2})?)/i,
  ];

  for (const pattern of feePatterns) {
    const match = pageText.match(pattern);
    if (match) {
      const value = Number(match[1].replace(/,/g, ""));
      if (!Number.isNaN(value)) return value;
    }
  }

  // Only trust a bare "no annual fee" claim if it isn't a nav/category link ("No Annual Fee
  // Cards") and has no nearby waiver/promo qualifier ("first year", "year one", "waived")
  // within ~60 characters — both patterns showed up as real false positives during testing
  // (Amex's own site nav, and "no annual fee for the first year" promo copy).
  const noFeeRegex = /\bno\s+annual\s+fee\b/gi;
  let match: RegExpExecArray | null;
  while ((match = noFeeRegex.exec(pageText)) !== null) {
    const windowStart = Math.max(0, match.index - 60);
    const windowEnd = Math.min(pageText.length, match.index + match[0].length + 60);
    const surrounding = pageText.slice(windowStart, windowEnd);
    const isNavCategoryLink = /no\s+annual\s+fee\s+cards\b/i.test(pageText.slice(match.index, match.index + match[0].length + 10));
    const hasWaiverQualifier = /first\s+year|year\s+one|waived|for\s+the\s+first|supplementary|additional\s+card/i.test(surrounding);
    if (!isNavCategoryLink && !hasWaiverQualifier) {
      return 0;
    }
  }

  return null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");
}

async function scrapeOne(card: {
  id: string;
  slug: string;
  name: string;
  fee: unknown;
  sourceUrl: string;
}) {
  const currentFee = Number(card.fee);

  let html: string;
  try {
    const res = await fetch(card.sourceUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.warn(`[${card.slug}] fetch failed: HTTP ${res.status} — skipping`);
      return;
    }
    html = await res.text();
  } catch (err) {
    console.warn(`[${card.slug}] fetch error: ${err instanceof Error ? err.message : err} — skipping`);
    return;
  }

  const scrapedFee = extractAnnualFee(stripHtml(html));

  if (scrapedFee === null) {
    console.warn(`[${card.slug}] could not parse annual fee from page — skipping (no false proposal created)`);
    return;
  }

  if (scrapedFee === currentFee) {
    console.log(`[${card.slug}] fee unchanged ($${currentFee}) — nothing to do`);
    return;
  }

  // Don't create a duplicate pending proposal for the same detected change on repeat runs.
  const existing = await prisma.creditCardChangeProposal.findFirst({
    where: { productId: card.id, status: "pending" },
  });
  if (existing) {
    const existingChanges = existing.fieldChanges as Record<string, { newValue: unknown }>;
    if (existingChanges.fee?.newValue === scrapedFee) {
      console.log(`[${card.slug}] change already staged for review — skipping duplicate`);
      return;
    }
  }

  await prisma.creditCardChangeProposal.create({
    data: {
      productId: card.id,
      fieldChanges: {
        fee: { oldValue: currentFee, newValue: scrapedFee },
      },
    },
  });
  console.log(`[${card.slug}] fee change detected: $${currentFee} -> $${scrapedFee} — staged for review`);
}

async function main() {
  const cards = await prisma.creditCardProduct.findMany({ where: { isActive: true } });
  console.log(`Scraping ${cards.length} credit card product pages...`);

  for (const card of cards) {
    await scrapeOne(card);
    // Small delay between requests — this hits each bank's own domain once per night,
    // not a high-volume crawl, but there's no reason to hammer them back-to-back.
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  console.log("Scrape run complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
