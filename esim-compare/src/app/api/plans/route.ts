import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get("country"); // e.g., "LT"
  const sort = req.nextUrl.searchParams.get("sort") ?? "pricePerGBUsd";
  if (!country) return NextResponse.json({ error: "country required" }, { status: 400 });

  const plans = await prisma.plan.findMany({
    where: { coverage: { some: { countryId: country } } },
    include: { provider: true },
    orderBy: { [sort]: "asc" as const }
  });

  return NextResponse.json(plans.map(p => ({
    id: p.id,
    provider: p.provider.name,
    name: p.name,
    dataGB: Math.round((p.dataAllowanceMB/1024) * 10)/10,
    validityDays: p.validityDays,
    priceUsd: Number(p.priceUsd),
    pricePerGBUsd: Number(p.pricePerGBUsd),
    hotspotAllowed: p.hotspotAllowed,
    speedCapMbps: p.speedCapMbps,
    purchaseUrl: p.affiliateLink ?? p.purchaseUrl,
    slug: p.slug
  })));
}
