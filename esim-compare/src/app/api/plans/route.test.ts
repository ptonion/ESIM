import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { GET } from './route';
import prisma from '@/lib/prisma';

const plans = {
  JP: [
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
      slug: 'japan-plan'
    }
  ],
  LT: [
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
      slug: 'lithuania-plan'
    }
  ]
} as const;

before(() => {
  // mock prisma call
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (prisma.plan.findMany as any) = async ({ where }: any) => {
    return plans[where.coverage.some.countryId as 'JP' | 'LT'] ?? [];
  };
});

test('returns Japan plans for country JP', async () => {
  const req = new NextRequest('http://localhost/api/plans?country=JP');
  const res = await GET(req);
  const body = await res.json();
  const names = body.map((p: any) => p.name);
  assert(names.includes('Japan Plan'));
  assert(!names.includes('Lithuania Plan'));
});

test('returns Lithuania plans for country LT', async () => {
  const req = new NextRequest('http://localhost/api/plans?country=LT');
  const res = await GET(req);
  const body = await res.json();
  const names = body.map((p: any) => p.name);
  assert(names.includes('Lithuania Plan'));
  assert(!names.includes('Japan Plan'));
});

after(async () => {
  await prisma.$disconnect();
});
