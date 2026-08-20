"use client";

import { RefuelWithMetrics, Vehicle } from "@/lib/types";
import { averageCostPerDistance, averageEfficiency, totalSpent } from "@/lib/calculations";
import { formatCOP } from "@/lib/format";
import { useTranslation } from "@/lib/i18n/LanguageContext";
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
  const { t } = useTranslation();
  const spentThisMonth = totalSpent(monthRecords);
  const avgEff = averageEfficiency(allRecords);
  const avgCostPerDist = averageCostPerDistance(allRecords);

  const effUnit = vehicle.distance_unit === "km" ? `km/${vehicle.volume_unit}` : `mi/${vehicle.volume_unit}`;
  const distUnit = vehicle.distance_unit;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="panel p-5 flex flex-col justify-between animate-rise">
        <div className="flex items-center gap-2 text-dash-muted text-sm mb-4">
          <Wallet className="w-4 h-4" /> {t("summary.spentThisMonth")}
        </div>
        <div className="stat-value">{formatCOP(spentThisMonth)}</div>
        <div className="text-xs text-dash-muted mt-1">
          {monthRecords.length} {monthRecords.length === 1 ? t("summary.fillUp") : t("summary.fillUps")}
        </div>
      </div>

      <div className="panel p-5 flex flex-col items-center animate-rise [animation-delay:60ms] opacity-0 [animation-fill-mode:forwards]">
        <div className="flex items-center gap-2 text-dash-muted text-sm mb-2 self-start">
          <Gauge className="w-4 h-4" /> {t("summary.avgEfficiency")}
        </div>
        <FuelGauge value={avgEff} min={0} max={25} label={t("summary.allTimeAvg")} unitLabel={effUnit} />
      </div>

      <div className="panel p-5 flex flex-col justify-between animate-rise [animation-delay:120ms] opacity-0 [animation-fill-mode:forwards]">
        <div className="flex items-center gap-2 text-dash-muted text-sm mb-4">
          <Route className="w-4 h-4" /> {t("summary.costPerDistance", { unit: distUnit })}
        </div>
        <div className="stat-value">
          {avgCostPerDist != null ? formatCOP(avgCostPerDist) : "—"}
        </div>
        <div className="text-xs text-dash-muted mt-1">
          {t("summary.basedOnRecords", { count: allRecords.length })}
        </div>
      </div>
    </div>
  );
}
