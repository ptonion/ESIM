import prisma from "../src/lib/prisma";

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
  await prisma.provider.upsert({
    where: { slug: "airalo" },
    update: {},
    create: {
      name: "Airalo",
      slug: "airalo",
      siteUrl: "https://www.airalo.com",
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
