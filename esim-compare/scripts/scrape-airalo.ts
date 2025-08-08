import { chromium } from "playwright";
import * as cheerio from "cheerio";
import prisma from "../src/lib/prisma";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ userAgent: "esim-compare-bot/1.0 (+contact@example.com)" });
  await page.goto("https://www.airalo.com/global-esim", { waitUntil: "networkidle" });
  const html = await page.content();
  await browser.close();

  const $ = cheerio.load(html);
  // TODO: adjust selectors to Airalo’s DOM
  const parsed = [{
    providerSlug: "airalo",
    name: "Discover Global 10GB",
    dataMB: 10240, validityDays: 30,
    priceAmount: 24.99, priceCurrency: "USD",
    hotspotAllowed: true, speedCapMbps: 50,
    purchaseUrl: "https://www.airalo.com/global-esim",
    countries: ["LT","JP"]
  }];

  const provider = await prisma.provider.findUnique({ where: { slug: "airalo" }});
  if (!provider) throw new Error("Provider not seeded.");

  for (const p of parsed) {
    const slug = `airalo-discover-global-10gb-30d`;
    const plan = await prisma.plan.upsert({
      where: { slug },
      update: {
        priceAmount: p.priceAmount,
        priceCurrency: p.priceCurrency,
        priceUsd: p.priceAmount,
        pricePerGBUsd: p.priceAmount / (p.dataMB/1024),
        lastCheckedAt: new Date()
      },
      create: {
        providerId: provider.id, slug, name: p.name,
        dataAllowanceMB: p.dataMB, validityDays: p.validityDays,
        priceAmount: p.priceAmount, priceCurrency: p.priceCurrency,
        priceUsd: p.priceAmount, pricePerGBUsd: p.priceAmount / (p.dataMB/1024),
        hotspotAllowed: p.hotspotAllowed, speedCapMbps: p.speedCapMbps,
        roamingRegion: "Global", purchaseUrl: p.purchaseUrl
      }
    });

    for (const iso of p.countries) {
      await prisma.planCountry.upsert({
        where: { planId_countryId: { planId: plan.id, countryId: iso }},
        update: {},
        create: { planId: plan.id, countryId: iso }
      });
    }
  }

  console.log("Scraped Airalo (stub).");
  await prisma.$disconnect();
})();
