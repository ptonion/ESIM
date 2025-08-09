import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const ALLOWED_SORT_KEYS = ["pricePerGBUsd", "priceUsd", "validityDays"] as const;
type SortKey = (typeof ALLOWED_SORT_KEYS)[number];

export async function GET(req: NextRequest) {
  const countriesParam = req.nextUrl.searchParams.get("countries");
  const sortParam = req.nextUrl.searchParams.get("sort");
  const q = req.nextUrl.searchParams.get("q");

  if (!countriesParam) {
    return NextResponse.json({ error: "countries required" }, { status: 400 });
  }

  const countries = countriesParam
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  if (countries.length === 0) {
    return NextResponse.json({ error: "countries required" }, { status: 400 });
  }

  const sort: SortKey =
    sortParam && ALLOWED_SORT_KEYS.includes(sortParam as SortKey)
      ? (sortParam as SortKey)
      : "pricePerGBUsd";

  if (sortParam && !ALLOWED_SORT_KEYS.includes(sortParam as SortKey)) {
    return NextResponse.json({ error: "unsupported sort key" }, { status: 400 });
  }

  const plans = await prisma.plan.findMany({
    where: {
      coverage: { some: { countryId: { in: countries } } },
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { provider: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: { provider: true, coverage: true },
    orderBy: { [sort]: "asc" as const },
  });

  const result: Record<string, Record<string, any[]>> = {};
  const countrySet = new Set(countries);

  for (const p of plans) {
    const planObj = {
      id: p.id,
      provider: p.provider.name,
      name: p.name,
      dataGB: Math.round((p.dataAllowanceMB / 1024) * 10) / 10,
      validityDays: p.validityDays,
      priceUsd: Number(p.priceUsd),
      pricePerGBUsd: Number(p.pricePerGBUsd),
      hotspotAllowed: p.hotspotAllowed,
      speedCapMbps: p.speedCapMbps,
      purchaseUrl: p.affiliateLink ?? p.purchaseUrl,
      slug: p.slug,
    };
    for (const cov of p.coverage) {
      if (!countrySet.has(cov.countryId)) continue;
      if (!result[cov.countryId]) result[cov.countryId] = {};
      if (!result[cov.countryId][p.provider.name])
        result[cov.countryId][p.provider.name] = [];
      result[cov.countryId][p.provider.name].push(planObj);
    }
  }

  return NextResponse.json(result);
}
