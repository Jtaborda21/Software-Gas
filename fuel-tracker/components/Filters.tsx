"use client";

import { useState } from "react";

export type FilterState =
  | { mode: "all" }
  | { mode: "month"; year: number; month: number } // month is 0-indexed
  | { mode: "year"; year: number }
  | { mode: "range"; from: string; to: string };

export default function Filters({
  value,
  onChange,
}: {
  value: FilterState;
  onChange: (f: FilterState) => void;
}) {
  const now = new Date();
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const monthNames = Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(2000, i, 1))
  );

  return (
    <div className="panel p-4 flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <FilterChip active={value.mode === "all"} onClick={() => onChange({ mode: "all" })}>
          All time
        </FilterChip>
        <FilterChip
          active={value.mode === "month" && value.year === now.getFullYear() && value.month === now.getMonth()}
          onClick={() => onChange({ mode: "month", year: now.getFullYear(), month: now.getMonth() })}
        >
          This month
        </FilterChip>
        <FilterChip
          active={value.mode === "year" && value.year === now.getFullYear()}
          onClick={() => onChange({ mode: "year", year: now.getFullYear() })}
        >
          This year
        </FilterChip>
      </div>

      <div className="flex flex-wrap items-end gap-3 pt-2 border-t border-dash-line">
        <div className="flex gap-2">
          <select
            className="tap-input !py-2.5 !px-3 w-auto"
            value={value.mode === "month" ? value.month : now.getMonth()}
            onChange={(e) =>
              onChange({
                mode: "month",
                year: value.mode === "month" ? value.year : now.getFullYear(),
                month: Number(e.target.value),
              })
            }
          >
            {monthNames.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>
          <select
            className="tap-input !py-2.5 !px-3 w-auto"
            value={value.mode === "month" || value.mode === "year" ? value.year : now.getFullYear()}
            onChange={(e) => {
              const year = Number(e.target.value);
              onChange(
                value.mode === "year"
                  ? { mode: "year", year }
                  : { mode: "month", year, month: value.mode === "month" ? value.month : now.getMonth() }
              );
            }}
          >
            {Array.from({ length: 6 }, (_, i) => now.getFullYear() - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="h-6 w-px bg-dash-line hidden sm:block" />

        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="tap-label">From</label>
            <input
              type="date"
              className="tap-input !py-2.5"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="tap-label">To</label>
            <input
              type="date"
              className="tap-input !py-2.5"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
            />
          </div>
          <button
            className="btn-secondary !py-2.5"
            disabled={!customFrom || !customTo}
            onClick={() => onChange({ mode: "range", from: customFrom, to: customTo })}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-colors ${
        active
          ? "bg-gauge-amber text-dash-bg border-gauge-amber"
          : "bg-dash-raised text-dash-muted border-dash-line"
      }`}
    >
      {children}
    </button>
  );
}
