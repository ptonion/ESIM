export const dynamic = "force-dynamic";

import Link from "next/link";

interface Plan {
  id: string;
  provider: string;
  name: string;
  dataGB: number;
  validityDays: number;
  priceUsd: number;
  pricePerGBUsd: number;
  hotspotAllowed: boolean;
  purchaseUrl: string;
}

async function getPlans(iso2: string): Promise<Plan[]> {
  const params = new URLSearchParams({ country: iso2 });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const res = await fetch(`${baseUrl}/api/plans?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function CountriesPage({
  searchParams,
}: {
  searchParams: Promise<{ list?: string }>;
}) {
  const { list = "" } = await searchParams;
  const codes = list
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);

  const plansByCountry = await Promise.all(
    codes.map(async (iso2) => ({ iso2, plans: await getPlans(iso2) }))
  );

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Best eSIM plans by country</h1>
      {plansByCountry.map(({ iso2, plans }) => (
        <section key={iso2} className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            Best eSIM plans for {iso2}
          </h2>
          {plans.length === 0 ? (
            <p>No plans yet. Check back soon.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Provider</th>
                    <th className="py-2 pr-4">Plan</th>
                    <th className="py-2 pr-4">Data</th>
                    <th className="py-2 pr-4">Validity</th>
                    <th className="py-2 pr-4">Price</th>
                    <th className="py-2 pr-4">$/GB</th>
                    <th className="py-2 pr-4">Hotspot</th>
                    <th className="py-2 pr-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan.id} className="border-b">
                      <td className="py-2 pr-4">{plan.provider}</td>
                      <td className="py-2 pr-4">{plan.name}</td>
                      <td className="py-2 pr-4">{plan.dataGB} GB</td>
                      <td className="py-2 pr-4">{plan.validityDays} days</td>
                      <td className="py-2 pr-4">${plan.priceUsd.toFixed(2)}</td>
                      <td className="py-2 pr-4">${plan.pricePerGBUsd.toFixed(2)}</td>
                      <td className="py-2 pr-4">
                        {plan.hotspotAllowed ? "Yes" : "—"}
                      </td>
                      <td className="py-2 pr-4">
                        <Link
                          href={plan.purchaseUrl}
                          className="underline"
                          target="_blank"
                        >
                          Buy
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}
    </main>
  );
}

