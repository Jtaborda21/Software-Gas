"use client";

import { RefuelWithMetrics, Vehicle } from "@/lib/types";
import { format } from "date-fns";
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
  const effUnit = vehicle.distance_unit === "km" ? `km/${vehicle.volume_unit}` : `mi/${vehicle.volume_unit}`;

  if (records.length === 0) {
    return (
      <div className="panel p-10 flex flex-col items-center text-center text-dash-muted">
        <Fuel className="w-8 h-8 mb-3 opacity-50" />
        <p className="text-sm">No fill-ups in this range yet.</p>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden">
      {/* Desktop table */}
      <table className="w-full hidden sm:table">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-dash-muted border-b border-dash-line">
            <th className="px-5 py-3 font-medium">Date</th>
            <th className="px-5 py-3 font-medium">{vehicle.volume_unit}</th>
            <th className="px-5 py-3 font-medium">Cost</th>
            <th className="px-5 py-3 font-medium">{vehicle.distance_unit}</th>
            <th className="px-5 py-3 font-medium">Efficiency</th>
            <th className="px-5 py-3 font-medium">Gauge before</th>
            <th className="px-5 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-b border-dash-line last:border-0 hover:bg-dash-raised/60">
              <td className="px-5 py-3 text-sm font-mono tabular-nums">{format(new Date(r.refuel_at), "MMM d, yyyy")}</td>
              <td className="px-5 py-3 text-sm font-mono tabular-nums">{r.volume.toFixed(2)}</td>
              <td className="px-5 py-3 text-sm font-mono tabular-nums">
                {vehicle.currency} {r.total_cost.toFixed(2)}
              </td>
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
                  aria-label="Delete record"
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
                {format(new Date(r.refuel_at), "MMM d, yyyy")}
              </span>
              <button
                onClick={() => onDelete(r.id)}
                className="text-dash-muted hover:text-gauge-red transition-colors p-1"
                aria-label="Delete record"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-dash-muted">
                {r.volume.toFixed(2)} {vehicle.volume_unit} · {vehicle.currency} {r.total_cost.toFixed(2)}
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
