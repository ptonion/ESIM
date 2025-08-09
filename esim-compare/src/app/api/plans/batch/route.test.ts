import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { GET } from './route';
import prisma from '@/lib/prisma';

const plans = [
  {
    id: 'jp1',
    provider: { name: 'Airalo' },
    name: 'Japan Plan',
    dataAllowanceMB: 1024,
    validityDays: 7,
    priceUsd: 5,
    pricePerGBUsd: 5,
    hotspotAllowed: true,
    speedCapMbps: null,
    purchaseUrl: 'https://example.com/japan-plan',
    affiliateLink: null,
    slug: 'japan-plan',
    coverage: [{ countryId: 'JP' }]
  },
  {
    id: 'lt1',
    provider: { name: 'Airalo' },
    name: 'Lithuania Plan',
    dataAllowanceMB: 1024,
    validityDays: 7,
    priceUsd: 4,
    pricePerGBUsd: 4,
    hotspotAllowed: false,
    speedCapMbps: null,
    purchaseUrl: 'https://example.com/lithuania-plan',
    affiliateLink: null,
    slug: 'lithuania-plan',
    coverage: [{ countryId: 'LT' }]
  }
] as const;

before(() => {
  // mock prisma call
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (prisma.plan.findMany as any) = async ({ where }: any) => {
    const requested = where.coverage.some.countryId.in as string[];
    return plans.filter((p) =>
      p.coverage.some((c) => requested.includes(c.countryId))
    );
  };
});

test('returns distinct plans for multiple countries', async () => {
  const req = new NextRequest('http://localhost/api/plans/batch?countries=JP,LT');
  const res = await GET(req);
  const body = await res.json();
  const jpNames = body.JP.Airalo.map((p: any) => p.name);
  const ltNames = body.LT.Airalo.map((p: any) => p.name);
  assert(jpNames.includes('Japan Plan'));
  assert(!jpNames.includes('Lithuania Plan'));
  assert(ltNames.includes('Lithuania Plan'));
  assert(!ltNames.includes('Japan Plan'));
});

after(async () => {
  await prisma.$disconnect();
});
