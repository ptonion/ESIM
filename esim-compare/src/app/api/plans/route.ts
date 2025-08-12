import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export interface PlanApiResponse {
  id: string;
  provider: string;
  name: string;
  dataGB: number;
  validityDays: number;
  priceUsd: number;
  pricePerGBUsd: number;
  hotspotAllowed: boolean | null;
  speedCapMbps: number | null;
  purchaseUrl: string;
  slug: string;
}

const ALLOWED_SORT_KEYS = ["pricePerGBUsd", "priceUsd", "validityDays"] as const;
type SortKey = typeof ALLOWED_SORT_KEYS[number];

export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get("country"); // e.g., "LT"
  const sortParam = req.nextUrl.searchParams.get("sort");
  const q = req.nextUrl.searchParams.get("q");
  const sort: SortKey = sortParam && ALLOWED_SORT_KEYS.includes(sortParam as SortKey)
    ? (sortParam as SortKey)
    : "pricePerGBUsd";
  if (!country) return NextResponse.json({ error: "country required" }, { status: 400 });
  if (sortParam && !ALLOWED_SORT_KEYS.includes(sortParam as SortKey)) {
    return NextResponse.json({ error: "unsupported sort key" }, { status: 400 });
  }

  const plans = await prisma.plan.findMany({
    where: {
      coverage: { some: { countryId: country } },
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { provider: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: { provider: true },
    orderBy: { [sort]: "asc" as const }
  });

  return NextResponse.json<PlanApiResponse[]>(
    plans.map((p): PlanApiResponse => ({
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
    }))
  );
}
