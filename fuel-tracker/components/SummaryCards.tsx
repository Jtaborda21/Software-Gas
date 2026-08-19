"use client";

import { RefuelWithMetrics, Vehicle } from "@/lib/types";
import { averageCostPerDistance, averageEfficiency, totalSpent } from "@/lib/calculations";
import FuelGauge from "./FuelGauge";
import { Wallet, Gauge, Route } from "lucide-react";

export default function SummaryCards({
  monthRecords,
  allRecords,
  vehicle,
}: {
  monthRecords: RefuelWithMetrics[];
  allRecords: RefuelWithMetrics[];
  vehicle: Vehicle;
}) {
  const spentThisMonth = totalSpent(monthRecords);
  const avgEff = averageEfficiency(allRecords);
  const avgCostPerDist = averageCostPerDistance(allRecords);

  const effUnit = vehicle.distance_unit === "km" ? `km/${vehicle.volume_unit}` : `mi/${vehicle.volume_unit}`;
  const distUnit = vehicle.distance_unit;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="panel p-5 flex flex-col justify-between animate-rise">
        <div className="flex items-center gap-2 text-dash-muted text-sm mb-4">
          <Wallet className="w-4 h-4" /> Spent this month
        </div>
        <div className="stat-value">
          {vehicle.currency} {spentThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-dash-muted mt-1">{monthRecords.length} fill-up{monthRecords.length === 1 ? "" : "s"}</div>
      </div>

      <div className="panel p-5 flex flex-col items-center animate-rise [animation-delay:60ms] opacity-0 [animation-fill-mode:forwards]">
        <div className="flex items-center gap-2 text-dash-muted text-sm mb-2 self-start">
          <Gauge className="w-4 h-4" /> Average efficiency
        </div>
        <FuelGauge value={avgEff} min={0} max={25} label="all-time average" unitLabel={effUnit} />
      </div>

      <div className="panel p-5 flex flex-col justify-between animate-rise [animation-delay:120ms] opacity-0 [animation-fill-mode:forwards]">
        <div className="flex items-center gap-2 text-dash-muted text-sm mb-4">
          <Route className="w-4 h-4" /> Est. cost per {distUnit}
        </div>
        <div className="stat-value">
          {avgCostPerDist != null ? `${vehicle.currency} ${avgCostPerDist.toFixed(3)}` : "—"}
        </div>
        <div className="text-xs text-dash-muted mt-1">based on {allRecords.length} record{allRecords.length === 1 ? "" : "s"}</div>
      </div>
    </div>
  );
}
