import { RefuelRecord, RefuelWithMetrics } from "./types";

/**
 * Derives efficiency + cost metrics for each record.
 * Uses the "full-to-full" method: efficiency is only trustworthy when
 * `is_full_tank` is true and a trip distance is known, since partial
 * fill-ups don't represent a complete consumption cycle.
 */
export function enrichRecords(records: RefuelRecord[]): RefuelWithMetrics[] {
  return records.map((r) => {
    const hasDistance = r.trip_distance != null && r.trip_distance > 0;

    const distancePerVolume =
      r.is_full_tank && hasDistance ? round2(r.trip_distance! / r.volume) : null;

    const volumePer100 =
      r.is_full_tank && hasDistance ? round2((r.volume / r.trip_distance!) * 100) : null;

    const costPerDistance = hasDistance ? round(r.total_cost / r.trip_distance!, 4) : null;

    return { ...r, distancePerVolume, volumePer100, costPerDistance };
  });
}

export function round(n: number, digits = 2) {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}
export function round2(n: number) {
  return round(n, 2);
}

/** Average km/L (or mi/gal) across records that have a valid reading. */
export function averageEfficiency(records: RefuelWithMetrics[]): number | null {
  const valid = records.filter((r) => r.distancePerVolume != null);
  if (valid.length === 0) return null;
  const sum = valid.reduce((acc, r) => acc + (r.distancePerVolume as number), 0);
  return round2(sum / valid.length);
}

export function totalSpent(records: RefuelRecord[]): number {
  return round2(records.reduce((acc, r) => acc + r.total_cost, 0));
}

export function averageCostPerDistance(records: RefuelWithMetrics[]): number | null {
  const valid = records.filter((r) => r.costPerDistance != null);
  if (valid.length === 0) return null;
  const sum = valid.reduce((acc, r) => acc + (r.costPerDistance as number), 0);
  return round(sum / valid.length, 3);
}

export function recordsInMonth(records: RefuelRecord[], year: number, month0: number) {
  return records.filter((r) => {
    const d = new Date(r.refuel_at);
    return d.getFullYear() === year && d.getMonth() === month0;
  });
}

export interface MonthlyPoint {
  label: string;   // e.g. "Jan 2026"
  monthKey: string; // e.g. "2026-01"
  totalSpent: number;
  totalVolume: number;
  avgEfficiency: number | null;
}

/** Groups records by calendar month for the bar/line chart. */
export function groupByMonth(records: RefuelRecord[]): MonthlyPoint[] {
  const enriched = enrichRecords(records);
  const buckets = new Map<string, RefuelWithMetrics[]>();

  for (const r of enriched) {
    const d = new Date(r.refuel_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(r);
  }

  const formatter = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, recs]) => {
      const [y, m] = key.split("-").map(Number);
      return {
        monthKey: key,
        label: formatter.format(new Date(y, m - 1, 1)),
        totalSpent: totalSpent(recs),
        totalVolume: round2(recs.reduce((acc, r) => acc + r.volume, 0)),
        avgEfficiency: averageEfficiency(recs),
      };
    });
}

/** Filters records to an inclusive date range. */
export function filterByDateRange(
  records: RefuelRecord[],
  from?: string | null,
  to?: string | null
): RefuelRecord[] {
  return records.filter((r) => {
    const t = new Date(r.refuel_at).getTime();
    if (from && t < new Date(from).getTime()) return false;
    if (to && t > new Date(to).getTime() + 86_400_000 - 1) return false;
    return true;
  });
}
