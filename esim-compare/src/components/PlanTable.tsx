import React from "react";

export interface Plan {
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

export default function PlanTable({ plans }: { plans: Plan[] }) {
  return (
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
              <td className="py-2 pr-4">{plan.hotspotAllowed ? "Yes" : "—"}</td>
              <td className="py-2 pr-4">
                <a href={plan.purchaseUrl} className="underline" target="_blank" rel="noopener noreferrer">
                  Buy
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

