import { chromium } from "playwright";
import * as cheerio from "cheerio";
import slugify from "slugify";
import prisma from "../src/lib/prisma";

interface NomadCountry {
  iso2?: string;
}

interface NomadProduct {
  name: string;
  data_mb?: number;
  dataAllowanceMB?: number;
  validity_days?: number;
  validityDays?: number;
  price?: string;
  priceAmount?: string;
  currency?: string;
  hotspotAllowed?: boolean;
  speedCapMbps?: number | null;
  url?: string;
  slug?: string;
  countries?: NomadCountry[];
}

interface NomadData {
  props?: { pageProps?: { products: NomadProduct[] } };
  products?: NomadProduct[];
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
    await page.goto("https://getnomad.app/", { waitUntil: "networkidle" });
    const html = await page.content();

    const $ = cheerio.load(html);
    let data: NomadData | null = null;
    const nextData = $("#__NEXT_DATA__").html();
    if (nextData) {
      data = JSON.parse(nextData) as NomadData;
    } else {
      data = (await page.evaluate(
        () =>
          (window as unknown as { __NOMAD_DATA__?: unknown }).__NOMAD_DATA__ ?? null
      )) as NomadData | null;
    }
    const products: NomadProduct[] =
      data?.props?.pageProps?.products || data?.products || [];

    const parsed = products.map((pkg) => ({
      providerSlug: "nomad",
      name: pkg.name,
      dataMB: pkg.data_mb ?? pkg.dataAllowanceMB,
      validityDays: pkg.validity_days ?? pkg.validityDays,
      priceAmount: parseFloat(pkg.price ?? pkg.priceAmount),
      priceCurrency: pkg.currency || "USD",
      hotspotAllowed: pkg.hotspotAllowed ?? true,
      speedCapMbps: pkg.speedCapMbps ?? null,
      purchaseUrl: pkg.url || `https://getnomad.app/${pkg.slug || ""}`,
      countries: (pkg.countries ?? [])
        .map((c) => c.iso2?.toUpperCase())
        .filter((c): c is string => Boolean(c)),
      slug: slugify(`nomad-${pkg.slug || pkg.name}`.trim(), { lower: true }),
    }));

    const provider = await prisma.provider.findUnique({ where: { slug: "nomad" } });
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

    console.log(`Scraped Nomad: ${parsed.length} plans.`);
  } catch (err) {
    console.error("Error scraping Nomad:", err);
  } finally {
    await browser?.close();
    await prisma.$disconnect();
  }
})();
