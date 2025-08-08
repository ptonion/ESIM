import prisma from "../src/lib/prisma";
import { Prisma } from "@prisma/client";

async function main() {
  const countries = [
    { iso2: "LT", name: "Lithuania", region: "Europe" },
    { iso2: "JP", name: "Japan", region: "Asia" },
  ];

  for (const c of countries) {
    await prisma.country.upsert({
      where: { iso2: c.iso2 },
      update: { name: c.name, region: c.region ?? null },
      create: c,
    });
  }

  // ✅ Seed Airalo so scraper works
  const provider = await prisma.provider.upsert({
    where: { slug: "airalo" },
    update: {},
    create: {
      name: "Airalo",
      slug: "airalo",
      siteUrl: "https://www.airalo.com",
    },
  });

  // clear existing plans
  await prisma.planCountry.deleteMany();
  await prisma.plan.deleteMany();

  await prisma.plan.create({
    data: {
      providerId: provider.id,
      slug: "japan-plan",
      name: "Japan Plan",
      dataAllowanceMB: 1024,
      validityDays: 7,
      priceAmount: new Prisma.Decimal(5),
      priceCurrency: "USD",
      priceUsd: new Prisma.Decimal(5),
      pricePerGBUsd: new Prisma.Decimal(5),
      hotspotAllowed: true,
      purchaseUrl: "https://example.com/japan-plan",
      coverage: { create: [{ countryId: "JP" }] },
    },
  });

  await prisma.plan.create({
    data: {
      providerId: provider.id,
      slug: "lithuania-plan",
      name: "Lithuania Plan",
      dataAllowanceMB: 1024,
      validityDays: 7,
      priceAmount: new Prisma.Decimal(4),
      priceCurrency: "USD",
      priceUsd: new Prisma.Decimal(4),
      pricePerGBUsd: new Prisma.Decimal(4),
      hotspotAllowed: false,
      purchaseUrl: "https://example.com/lithuania-plan",
      coverage: { create: [{ countryId: "LT" }] },
    },
  });

  console.log("Seed OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
