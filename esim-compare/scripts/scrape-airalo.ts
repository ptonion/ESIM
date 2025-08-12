import { chromium } from "playwright";
import * as cheerio from "cheerio";
import vm from "vm";
import slugify from "slugify";
import prisma from "../src/lib/prisma";

interface AiraloCountry {
  slug: string;
}

interface AiraloPackage {
  operator: {
    title: string;
    countries: AiraloCountry[];
  };
  title: string;
  amount: number;
  day: number;
  price: {
    amount: string;
    currency: { code: string };
  };
  slug: string;
}

(async () => {
  let browser;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext({
      userAgent: "esim-compare-bot/1.0 (+contact@example.com)",
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();
    await page.goto("https://www.airalo.com/global-esim", { waitUntil: "networkidle" });
    const html = await page.content();

    const $ = cheerio.load(html);
    let nuxtScript: string | undefined;
    $("script").each((_, el) => {
      const content = $(el).html();
      if (content && content.includes("__NUXT__=")) nuxtScript = content;
    });
    if (!nuxtScript) throw new Error("Airalo data script not found");
    // evaluate nuxt data in a sandbox
    const sandbox: {
      window: { __NUXT__?: { fetch: Record<string, { packages: AiraloPackage[] }> } };
    } = { window: {} };
    vm.runInNewContext(nuxtScript, sandbox);
    const nuxt = sandbox.window.__NUXT__;
    const fetchKey = Object.keys(nuxt.fetch).find((k) => nuxt.fetch[k].packages);
    if (!fetchKey) throw new Error("Airalo packages not found");
    const packages: AiraloPackage[] = nuxt.fetch[fetchKey].packages;

    const parsed = packages.map((pkg) => ({
      providerSlug: "airalo",
      name: `${pkg.operator.title} ${pkg.title}`.trim(),
      dataMB: pkg.amount,
      validityDays: pkg.day,
      priceAmount: parseFloat(pkg.price.amount),
      priceCurrency: pkg.price.currency.code,
      hotspotAllowed: true,
      speedCapMbps: null,
      purchaseUrl: `https://www.airalo.com/global-esim/${pkg.slug}`,
      countries: pkg.operator.countries.map((c) => c.slug.toUpperCase()),
      slug: slugify(`airalo-${pkg.slug}`, { lower: true }),
    }));

    const provider = await prisma.provider.findUnique({ where: { slug: "airalo" } });
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

    console.log(`Scraped Airalo: ${parsed.length} plans.`);
  } catch (err) {
    console.error("Error scraping Airalo:", err);
  } finally {
    await browser?.close();
    await prisma.$disconnect();
  }
})();
