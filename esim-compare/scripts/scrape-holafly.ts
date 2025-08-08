import { chromium } from "playwright";
import * as cheerio from "cheerio";
import slugify from "slugify";
import prisma from "../src/lib/prisma";

(async () => {
  let browser;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext({
      userAgent: "esim-compare-bot/1.0 (+contact@example.com)",
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();
    await page.goto("https://www.holafly.com/", { waitUntil: "networkidle" });
    const html = await page.content();

    const $ = cheerio.load(html);
    const dataScript = $("#__NEXT_DATA__").html();
    if (!dataScript) throw new Error("Holafly data script not found");
    const nextData = JSON.parse(dataScript);
    const products = nextData?.props?.pageProps?.products || [];

    const parsed = products.map((pkg: any) => ({
      providerSlug: "holafly",
      name: pkg.name,
      dataMB: pkg.data_mb ?? pkg.dataAllowanceMB,
      validityDays: pkg.validity_days ?? pkg.validityDays,
      priceAmount: parseFloat(pkg.price ?? pkg.priceAmount),
      priceCurrency: pkg.currency || "USD",
      hotspotAllowed: pkg.hotspotAllowed ?? true,
      speedCapMbps: pkg.speedCapMbps ?? null,
      purchaseUrl: `https://www.holafly.com${pkg.slug || ""}`,
      countries: (pkg.countries || []).map((c: any) => c.iso2?.toUpperCase()),
      slug: slugify(`holafly-${pkg.slug || pkg.name}`.trim(), { lower: true }),
    }));

    const provider = await prisma.provider.findUnique({ where: { slug: "holafly" } });
    if (!provider) throw new Error("Provider not seeded.");

    for (const p of parsed) {
      try {
        const plan = await prisma.plan.upsert({
          where: { slug: p.slug },
          update: {
            priceAmount: p.priceAmount,
            priceCurrency: p.priceCurrency,
            priceUsd: p.priceAmount,
            pricePerGBUsd: p.priceAmount / (p.dataMB / 1024),
            lastCheckedAt: new Date(),
          },
          create: {
            providerId: provider.id,
            slug: p.slug,
            name: p.name,
            dataAllowanceMB: p.dataMB,
            validityDays: p.validityDays,
            priceAmount: p.priceAmount,
            priceCurrency: p.priceCurrency,
            priceUsd: p.priceAmount,
            pricePerGBUsd: p.priceAmount / (p.dataMB / 1024),
            hotspotAllowed: p.hotspotAllowed,
            speedCapMbps: p.speedCapMbps,
            roamingRegion: "Global",
            purchaseUrl: p.purchaseUrl,
          },
        });

        for (const iso of p.countries) {
          try {
            await prisma.planCountry.upsert({
              where: { planId_countryId: { planId: plan.id, countryId: iso } },
              update: {},
              create: { planId: plan.id, countryId: iso },
            });
          } catch (err) {
            console.error(`Failed to upsert country ${iso} for plan ${p.name}:`, err);
          }
        }
      } catch (err) {
        console.error(`Failed to upsert plan ${p.name}:`, err);
      }
    }

    console.log(`Scraped Holafly: ${parsed.length} plans.`);
  } catch (err) {
    console.error("Error scraping Holafly:", err);
  } finally {
    await browser?.close();
    await prisma.$disconnect();
  }
})();
