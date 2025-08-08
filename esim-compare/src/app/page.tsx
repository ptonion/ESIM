"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Country = {
  iso2: string;
  name: string;
};

export default function Home() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);

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

  const handleChange = (iso2: string) => {
    if (iso2) {
      router.push(`/country/${iso2}`);
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
    </main>
  );
}

