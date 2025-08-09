export const dynamic = "force-dynamic";

import PlanTable, { Plan } from "@/components/PlanTable";

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
            <PlanTable plans={plans} />
          )}
        </section>
      ))}
    </main>
  );
}

