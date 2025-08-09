export const dynamic = "force-dynamic";

import PlanTable, { Plan } from "@/components/PlanTable";

async function getPlans(iso2: string, q?: string): Promise<Plan[]> {
  const params = new URLSearchParams({ country: iso2 });
  if (q) params.set("q", q);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const res = await fetch(
    `${baseUrl}/api/plans?${params.toString()}`,
    {
      cache: "no-store",
    }
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function CountryPage({
  params,
  searchParams,
}: {
  params: Promise<{ iso2: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { iso2 } = await params;
  const { q = "" } = await searchParams;
  const plans = await getPlans(iso2.toUpperCase(), q);

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Best eSIM plans for {iso2.toUpperCase()}</h1>

      <form className="mb-4">
        <input
          type="text"
          name="q"
          placeholder="Search plans"
          defaultValue={q}
          className="border px-2 py-1 rounded-md mr-2 bg-background text-foreground"
        />
        <button
          type="submit"
          className="px-3 py-1 border rounded-md"
        >
          Search
        </button>
      </form>

      {plans.length === 0 ? (
        <p>No plans yet. Check back soon.</p>
      ) : (
        <PlanTable plans={plans} />
      )}
    </main>
  );
}
