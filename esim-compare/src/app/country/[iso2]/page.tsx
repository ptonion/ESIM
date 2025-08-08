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
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/plans?country=${iso2}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function CountryPage({ params }: { params: { iso2: string } }) {
  const plans = await getPlans(params.iso2.toUpperCase());

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Best eSIM plans for {params.iso2.toUpperCase()}</h1>

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
              {plans.map((p: Plan) => (
                <tr key={p.id} className="border-b">
                  <td className="py-2 pr-4">{p.provider}</td>
                  <td className="py-2 pr-4">{p.name}</td>
                  <td className="py-2 pr-4">{p.dataGB} GB</td>
                  <td className="py-2 pr-4">{p.validityDays} days</td>
                  <td className="py-2 pr-4">${p.priceUsd.toFixed(2)}</td>
                  <td className="py-2 pr-4">${p.pricePerGBUsd.toFixed(2)}</td>
                  <td className="py-2 pr-4">{p.hotspotAllowed ? "Yes" : "—"}</td>
                  <td className="py-2 pr-4">
                    <Link href={p.purchaseUrl} className="underline" target="_blank">Buy</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
