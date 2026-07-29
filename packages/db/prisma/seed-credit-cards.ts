import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// One-time population of the canonical credit card catalog (previously hardcoded in
// apps/web/src/app/credit-cards/CreditCardsClient.tsx). sourceUrl is the issuer's own
// product page — the nightly scraper (packages/db/scripts/scrape-credit-cards.ts) re-fetches
// this URL to detect fee/rate changes and stages them as CreditCardChangeProposal rows.
const CARDS = [
  {
    slug: "scotia-momentum",
    name: "Momentum Infinite Bill-Slasher",
    bank: "Scotia",
    brandColor: "#EC111A",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Scotiabank_logo.svg/250px-Scotiabank_logo.svg.png",
    cardImageUrl: "https://www.scotiabank.com/content/sc_scotiabank/ca/en/personal/credit-cards/visa/momentum-infinite-card/_jcr_content/root/container/main/container_heroBanner/teaser_copy_copy.coreimg.png/1777661077354/6655152-momentum-inf-groceries-catch-all-1600x900-e.png",
    fee: 120,
    perks: [
      "4% cash back on groceries and recurring bills",
      "2% cash back on gas and transportation",
      "1% cash back on all other purchases",
      "Includes comprehensive travel insurance"
    ],
    tips: "Maximize this card by linking your phone bill, internet bill, utilities, and streaming subscriptions directly to it.",
    rateGroceries: 0.04,
    rateDining: 0.01,
    rateRecurring: 0.04,
    rateOther: 0.01,
    signupBonus: "10% cash back on all purchases for the first 3 months (up to $2,000 in spend).",
    referralUrl: "#",
    sourceUrl: "https://www.scotiabank.com/ca/en/personal/credit-cards/visa/momentum-infinite-card.html"
  },
  {
    slug: "rogers-red",
    name: "Rogers Red Telecom Saver",
    bank: "Rogers Bank",
    brandColor: "#D6001C",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Rogers_Communications_%282015%29.svg/250px-Rogers_Communications_%282015%29.svg.png",
    cardImageUrl: "https://images.ctfassets.net/q52gnekwj7nu/6ONdIX8oBwO1AnUMRGByfK/cee39472d2454305b95eb79e9c8c2170/WEN_Card_Image.png",
    fee: 0,
    perks: [
      "2% value towards Rogers/Shaw/Fido bill payments",
      "1.5% cash back flat-rate on all everyday purchases",
      "No annual fee",
      "5 free Roam Like Home days annually"
    ],
    tips: "Best overall card if you are a Rogers or Shaw customer. The 1.5% flat-rate cash back beats almost every other no-fee card in Canada.",
    rateGroceries: 0.015,
    rateDining: 0.015,
    rateRecurring: 0.015,
    rateOther: 0.015,
    signupBonus: "10% cash back welcome bonus on all purchases up to $100.",
    referralUrl: "#",
    sourceUrl: "https://www.rogersbank.com/en/rogers_red_worldelite_mastercard_details/"
  },
  {
    slug: "tangerine-cashback",
    name: "Tangerine Category Customizer",
    bank: "Tangerine",
    brandColor: "#FF6600",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Tangerine_Bank_logo_2026.svg/250px-Tangerine_Bank_logo_2026.svg.png",
    cardImageUrl: "https://www.tangerine.ca/adobe/dynamicmedia/deliver/dm-aid--18ff11c3-32f2-402b-b325-f21ea2d67187/credit-card-money-back-card-592x648-en.jpg?quality=100&preferwebp=true",
    fee: 0,
    perks: [
      "2% cash back on up to 3 select categories of your choice",
      "0.5% base reward rate on other categories",
      "No annual fee",
      "Cashback paid monthly directly to savings account"
    ],
    tips: "Select 'Groceries', 'Restaurants', and 'Recurring Bills' as your 2% categories for optimal daily rewards.",
    rateGroceries: 0.02,
    rateDining: 0.02,
    rateRecurring: 0.02,
    rateOther: 0.005,
    signupBonus: "10% cash back in select categories for the first 2 months (up to $100).",
    referralUrl: "#",
    sourceUrl: "https://www.tangerine.ca/en/personal/spend/credit-cards/money-back-credit-card"
  },
  {
    slug: "simplii-cashback",
    name: "Simplii Foodie Cash Back",
    bank: "Simplii Financial",
    brandColor: "#00A650",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Simplii_Financial_logo.svg/250px-Simplii_Financial_logo.svg.png",
    cardImageUrl: "https://www.simplii.com/content/dam/simplii-assets/global/card-art/credit-card/cash-back-visa/simplii-credit-card-cashback-visa-static-front-tilted-en.png/_jcr_content/renditions/cq5dam.web.1280.1280.png",
    fee: 0,
    perks: [
      "4% rewards on restaurant dining, cafes, and bars",
      "1.5% on gas, groceries, and pharmacy bills",
      "0.5% on all other spending",
      "No annual fee"
    ],
    tips: "Keep this card in your wallet specifically for dining out and ordering delivery. It offers the highest dining rewards rate for a no-fee card.",
    rateGroceries: 0.015,
    rateDining: 0.04,
    rateRecurring: 0.005,
    rateOther: 0.005,
    signupBonus: "10% cash back on dining for the first 4 months (up to $500 in spend).",
    referralUrl: "#",
    sourceUrl: "https://www.simplii.com/en/credit-cards/cash-back-visa.html"
  },
  {
    slug: "cibc-dividend-infinite",
    name: "Dividend Visa Infinite",
    bank: "CIBC",
    brandColor: "#B10D2C",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/4/48/CIBC_logo_2021.svg/250px-CIBC_logo_2021.svg.png",
    cardImageUrl: "https://www.cibc.com/content/dam/global-assets/card-art/credit-cards/dividend-cards/cibc-dividend-visa-infinite-card/cibc-dividend-visa-infinite-card-en.png/_jcr_content/renditions/cq5dam.web.1280.1280.png",
    fee: 120,
    perks: [
      "4% cash back on eligible gas, EV charging, and groceries",
      "2% cash back on transportation, dining, recurring payments, and eligible travel",
      "1% cash back on all other purchases",
      "Complimentary travel medical and car rental insurance"
    ],
    tips: "Best if your biggest monthly spend is groceries or gas — the 4% rate here beats every no-fee card. Category bonuses cap at $20,000/year per category, so it stops paying off at very high volumes.",
    rateGroceries: 0.04,
    rateDining: 0.02,
    rateRecurring: 0.02,
    rateOther: 0.01,
    signupBonus: "10% cash back (up to $250) for the first 4 statements, plus a $50 bonus for setting up one pre-authorized payment.",
    referralUrl: "#",
    sourceUrl: "https://www.cibc.com/en/personal-banking/credit-cards/all-credit-cards/dividend-visa-infinite-card.html"
  },
  {
    slug: "bmo-cashback-world-elite",
    name: "CashBack World Elite Mastercard",
    bank: "BMO",
    brandColor: "#0079C1",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/BMO_Logo.svg/250px-BMO_Logo.svg.png",
    cardImageUrl: "https://milesopedia.com/wp-content/uploads/2022/06/BMO-CashBack-World-Elite-Mastercard-RGB-EN-FR-for-online-450x295.png",
    fee: 139,
    perks: [
      "5% cash back on groceries (capped monthly)",
      "4% cash back on transit, 3% on gas and EV charging",
      "2% cash back on recurring bill payments",
      "1% cash back on all other purchases"
    ],
    tips: "The 5% grocery rate is the highest of any card here, but it's capped at a low monthly spend cap — best for smaller households, not bulk grocery spenders.",
    rateGroceries: 0.05,
    rateDining: 0.01,
    rateRecurring: 0.02,
    rateOther: 0.01,
    signupBonus: "Up to $650 in first-year value, including monthly cash back bonuses and a waived $139 annual fee for year one.",
    referralUrl: "#",
    sourceUrl: "https://www.bmo.com/en-ca/main/personal/credit-cards/bmo-cashback-world-elite-mastercard/"
  },
  {
    slug: "amex-simplycash-preferred",
    name: "SimplyCash Preferred",
    bank: "American Express",
    brandColor: "#006FCF",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/250px-American_Express_logo_%282018%29.svg.png",
    cardImageUrl: "https://milesopedia.com/wp-content/uploads/2021/02/N-Carte-selecte-RemiseSimple-American-Express-450x285.png",
    fee: 120,
    perks: [
      "4% cash back on groceries and gas (capped at $1,200/year combined)",
      "2% cash back on all other purchases — no category tracking needed",
      "Purchase protection and extended warranty included",
      "Amex Offers marketplace discounts"
    ],
    tips: "The flat 2% base rate (versus 1% on most no-fee cards) makes this a strong all-rounder once you've maxed out the 4% grocery/gas cap. Confirm merchants accept Amex before relying on it as your only card.",
    rateGroceries: 0.04,
    rateDining: 0.02,
    rateRecurring: 0.02,
    rateOther: 0.02,
    signupBonus: "10% cash back on all purchases for the first 3 months (up to $2,000 spend), plus a $50 statement credit in month 13.",
    referralUrl: "#",
    sourceUrl: "https://www.americanexpress.com/en-ca/benefits/simplycashpreferred-card/"
  },
  {
    slug: "neo-mastercard",
    name: "Neo Mastercard",
    bank: "Neo Financial",
    brandColor: "#7B2FF7",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Neo_Financial_Logo.png/250px-Neo_Financial_Logo.png",
    cardImageUrl: "https://www.finder.com/niche-builder/679da71a0c135.png",
    fee: 0,
    perks: [
      "Average 5%+ cash back at 10,000+ Neo partner retailers",
      "1% cash back on gas and groceries with $10,000+ in your Neo account",
      "No annual fee, no minimum income requirement",
      "Cash back paid instantly, not monthly"
    ],
    tips: "Value here comes almost entirely from partner-merchant cash back, not the base rate — check the Neo partner list for your regular shops before counting on this as a primary card.",
    rateGroceries: 0.01,
    rateDining: 0.005,
    rateRecurring: 0.005,
    rateOther: 0.005,
    signupBonus: "Varies by current partner promotion — typically a one-time bonus after first purchase.",
    referralUrl: "#",
    sourceUrl: "https://www.finder.com/ca/credit-cards/neo-financial-credit-card-review"
  }
];

async function main() {
  console.log("Seeding credit card products...");
  for (const card of CARDS) {
    await prisma.creditCardProduct.upsert({
      where: { slug: card.slug },
      create: card,
      update: card
    });
    console.log(`Upserted: ${card.name}`);
  }
  console.log("Credit card catalog seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
