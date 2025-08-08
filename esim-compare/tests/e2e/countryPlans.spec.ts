import { test, expect } from "@playwright/test";
import prisma from "../../src/lib/prisma";

async function seed() {
  await prisma.planCountry.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.country.deleteMany();
  await prisma.provider.deleteMany();

  const provider = await prisma.provider.create({
    data: {
      name: "Test Provider",
      slug: "test-provider",
      siteUrl: "https://example.com",
    },
  });

  await prisma.country.createMany({
    data: [
      { iso2: "JP", name: "Japan", region: "Asia" },
      { iso2: "LT", name: "Lithuania", region: "Europe" },
    ],
  });

  await prisma.plan.create({
    data: {
      providerId: provider.id,
      slug: "jp-basic",
      name: "JP Basic",
      dataAllowanceMB: 1024,
      validityDays: 7,
      priceAmount: 5,
      priceCurrency: "USD",
      priceUsd: 5,
      pricePerGBUsd: 5,
      hotspotAllowed: true,
      purchaseUrl: "https://example.com/jp-basic",
      coverage: { create: [{ countryId: "JP" }] },
    },
  });

  await prisma.plan.create({
    data: {
      providerId: provider.id,
      slug: "jp-pro",
      name: "JP Pro",
      dataAllowanceMB: 2048,
      validityDays: 15,
      priceAmount: 8,
      priceCurrency: "USD",
      priceUsd: 8,
      pricePerGBUsd: 4,
      hotspotAllowed: true,
      purchaseUrl: "https://example.com/jp-pro",
      coverage: { create: [{ countryId: "JP" }] },
    },
  });

  await prisma.plan.create({
    data: {
      providerId: provider.id,
      slug: "lt-basic",
      name: "LT Basic",
      dataAllowanceMB: 1024,
      validityDays: 30,
      priceAmount: 4,
      priceCurrency: "USD",
      priceUsd: 4,
      pricePerGBUsd: 4,
      hotspotAllowed: false,
      purchaseUrl: "https://example.com/lt-basic",
      coverage: { create: [{ countryId: "LT" }] },
    },
  });

  await prisma.plan.create({
    data: {
      providerId: provider.id,
      slug: "lt-pro",
      name: "LT Pro",
      dataAllowanceMB: 3072,
      validityDays: 60,
      priceAmount: 9,
      priceCurrency: "USD",
      priceUsd: 9,
      pricePerGBUsd: 3,
      hotspotAllowed: false,
      purchaseUrl: "https://example.com/lt-pro",
      coverage: { create: [{ countryId: "LT" }] },
    },
  });
}

test.beforeAll(async () => {
  await seed();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("country pages show different plans", async ({ page }) => {
  await page.goto("/country/jp");
  const jpRows = await page.locator("tbody tr").allTextContents();
  expect(jpRows.length).toBeGreaterThan(1);

  await page.goto("/country/lt");
  const ltRows = await page.locator("tbody tr").allTextContents();
  expect(ltRows.length).toBeGreaterThan(1);

  expect(jpRows).not.toEqual(ltRows);
});
