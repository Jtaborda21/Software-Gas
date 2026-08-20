"use client";

/**
 * A semicircular instrument-style gauge — the app's signature visual,
 * echoing the physical fuel gauge on a car's dashboard. Used to show
 * average efficiency at a glance instead of a plain number.
 */
export default function FuelGauge({
  value,
  min,
  max,
  label,
  unitLabel,
}: {
  value: number | null;
  min: number;
  max: number;
  label: string;
  unitLabel: string;
}) {
  const pct = value == null ? 0 : Math.min(1, Math.max(0, (value - min) / (max - min)));
  const angle = -90 + pct * 180; // sweep from -90deg to +90deg

  const zoneColor = pct >= 0.6 ? "#22C7A9" : pct >= 0.3 ? "#F5A623" : "#FF5C5C";

  // Arc geometry
  const cx = 100;
  const cy = 100;
  const r = 78;
  const startAngle = -180; // left
  const endAngle = 0; // right (in degrees, standard math convention, 0 = right, 180 = left)

  const polarToCartesian = (angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const arcPath = (fromDeg: number, toDeg: number) => {
    const start = polarToCartesian(fromDeg);
    const end = polarToCartesian(toDeg);
    const largeArc = toDeg - fromDeg <= 180 ? 0 : 1;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  const needleEnd = polarToCartesian(startAngle + pct * 180);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 10 200 110" className="w-full max-w-[220px]">
        {/* Track */}
        <path d={arcPath(startAngle, endAngle)} fill="none" stroke="#242B33" strokeWidth={14} strokeLinecap="round" />
        {/* Value arc */}
        <path
          d={arcPath(startAngle, startAngle + pct * 180)}
          fill="none"
          stroke={zoneColor}
          strokeWidth={14}
          strokeLinecap="round"
        />
        {/* Needle */}
        <line x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y} stroke="#E9EDF1" strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={6} fill="#E9EDF1" />
      </svg>

      <div className="text-center -mt-2">
        <div className="stat-value">{value != null ? value.toFixed(1) : "—"}</div>
        <div className="text-xs text-dash-muted uppercase tracking-wide">{unitLabel}</div>
        <div className="text-sm text-dash-muted mt-1">{label}</div>
      </div>
    </div>
  );
}
