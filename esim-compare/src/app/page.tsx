"use client";

import { useEffect, useState } from "react";
import PlanTable, { Plan } from "@/components/PlanTable";

type Country = {
  iso2: string;
  name: string;
};

export default function Home() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/countries");
        if (res.ok) {
          const data = await res.json();
          setCountries(data);
        }
      } catch (err) {
        console.error("Failed to load countries", err);
      }
    };
    load();
  }, []);

  const handleChange = async (iso2: string) => {
    setSelectedCountry(iso2);
    if (!iso2) {
      setPlans([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/plans?country=${iso2}`, { cache: "no-store" });
      if (res.ok) {
        setPlans(await res.json());
      } else {
        setPlans([]);
      }
    } catch (err) {
      console.error("Failed to load plans", err);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 sm:p-10">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">
        Find eSIM plans by country
      </h1>
      <select
        defaultValue=""
        onChange={(e) => handleChange(e.target.value)}
        className="w-full max-w-xs p-2 border rounded-md bg-background text-foreground"
      >
        <option value="" disabled>
          Select a country
        </option>
        {countries.map((c) => (
          <option key={c.iso2} value={c.iso2}>
            {c.name}
          </option>
        ))}
      </select>
      {loading && <p className="mt-4">Loading...</p>}
      {!loading && selectedCountry && (
        plans.length === 0 ? (
          <p className="mt-4">No plans yet. Check back soon.</p>
        ) : (
          <div className="mt-4 w-full max-w-5xl">
            <PlanTable plans={plans} />
          </div>
        )
      )}
    </main>
  );
}

