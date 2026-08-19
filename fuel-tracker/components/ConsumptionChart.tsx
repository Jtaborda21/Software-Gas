"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { MonthlyPoint } from "@/lib/calculations";
import { Vehicle } from "@/lib/types";

export default function ConsumptionChart({
  data,
  vehicle,
}: {
  data: MonthlyPoint[];
  vehicle: Vehicle;
}) {
  const effUnit = vehicle.distance_unit === "km" ? `km/${vehicle.volume_unit}` : `mi/${vehicle.volume_unit}`;

  if (data.length === 0) {
    return (
      <div className="panel p-8 flex items-center justify-center h-72 text-dash-muted text-sm">
        No fill-ups yet — log one to see your trend here.
      </div>
    );
  }

  return (
    <div className="panel p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-base font-semibold text-dash-text">Monthly consumption</h3>
      </div>
      <div className="h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="#242B33" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#828C99", fontSize: 12 }}
              axisLine={{ stroke: "#242B33" }}
              tickLine={false}
            />
            <YAxis
              yAxisId="cost"
              tick={{ fill: "#828C99", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <YAxis
              yAxisId="eff"
              orientation="right"
              tick={{ fill: "#828C99", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: "#1B2129",
                border: "1px solid #242B33",
                borderRadius: 12,
                fontSize: 13,
                color: "#E9EDF1",
              }}
              labelStyle={{ color: "#828C99" }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "#828C99" }} />
            <Bar
              yAxisId="cost"
              dataKey="totalSpent"
              name={`Spent (${vehicle.currency})`}
              fill="#F5A623"
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
            <Line
              yAxisId="eff"
              type="monotone"
              dataKey="avgEfficiency"
              name={`Efficiency (${effUnit})`}
              stroke="#22C7A9"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#22C7A9" }}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
