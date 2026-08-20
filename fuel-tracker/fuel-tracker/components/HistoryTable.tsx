"use client";

import { RefuelWithMetrics, Vehicle } from "@/lib/types";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { formatCOP } from "@/lib/format";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { Trash2, Fuel } from "lucide-react";

export default function HistoryTable({
  records,
  vehicle,
  onDelete,
}: {
  records: RefuelWithMetrics[];
  vehicle: Vehicle;
  onDelete: (id: string) => void;
}) {
  const { t, locale } = useTranslation();
  const dateLocale = locale === "es" ? es : enUS;
  const effUnit = vehicle.distance_unit === "km" ? `km/${vehicle.volume_unit}` : `mi/${vehicle.volume_unit}`;

  if (records.length === 0) {
    return (
      <div className="panel p-10 flex flex-col items-center text-center text-dash-muted">
        <Fuel className="w-8 h-8 mb-3 opacity-50" />
        <p className="text-sm">{t("history.empty")}</p>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden">
      {/* Desktop table */}
      <table className="w-full hidden sm:table">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-dash-muted border-b border-dash-line">
            <th className="px-5 py-3 font-medium">{t("history.date")}</th>
            <th className="px-5 py-3 font-medium">{vehicle.volume_unit}</th>
            <th className="px-5 py-3 font-medium">{t("history.cost")}</th>
            <th className="px-5 py-3 font-medium">{vehicle.distance_unit}</th>
            <th className="px-5 py-3 font-medium">{t("history.efficiency")}</th>
            <th className="px-5 py-3 font-medium">{t("history.gaugeBefore")}</th>
            <th className="px-5 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-b border-dash-line last:border-0 hover:bg-dash-raised/60">
              <td className="px-5 py-3 text-sm font-mono tabular-nums">
                {format(new Date(r.refuel_at), "MMM d, yyyy", { locale: dateLocale })}
              </td>
              <td className="px-5 py-3 text-sm font-mono tabular-nums">{r.volume.toFixed(2)}</td>
              <td className="px-5 py-3 text-sm font-mono tabular-nums">{formatCOP(r.total_cost)}</td>
              <td className="px-5 py-3 text-sm font-mono tabular-nums">
                {r.trip_distance != null ? r.trip_distance.toFixed(0) : "—"}
              </td>
              <td className="px-5 py-3 text-sm font-mono tabular-nums">
                {r.distancePerVolume != null ? `${r.distancePerVolume.toFixed(1)} ${effUnit}` : "—"}
              </td>
              <td className="px-5 py-3 text-sm text-dash-muted">
                {r.gauge_bars_before != null ? `${r.gauge_bars_before}/${vehicle.tank_bars}` : "—"}
              </td>
              <td className="px-5 py-3 text-right">
                <button
                  onClick={() => onDelete(r.id)}
                  className="text-dash-muted hover:text-gauge-red transition-colors p-1"
                  aria-label={t("history.delete")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile stacked cards */}
      <div className="sm:hidden divide-y divide-dash-line">
        {records.map((r) => (
          <div key={r.id} className="p-4 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm tabular-nums text-dash-text">
                {format(new Date(r.refuel_at), "MMM d, yyyy", { locale: dateLocale })}
              </span>
              <button
                onClick={() => onDelete(r.id)}
                className="text-dash-muted hover:text-gauge-red transition-colors p-1"
                aria-label={t("history.delete")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-dash-muted">
                {r.volume.toFixed(2)} {vehicle.volume_unit} · {formatCOP(r.total_cost)}
              </span>
              <span className="font-mono tabular-nums text-gauge-teal">
                {r.distancePerVolume != null ? `${r.distancePerVolume.toFixed(1)} ${effUnit}` : "—"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
