"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { Vehicle } from "@/lib/types";
import { Loader2 } from "lucide-react";

const CarVisualizer3D = dynamic(() => import("./CarVisualizer3D"), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center text-dash-muted text-sm">Loading 3D preview…</div>,
});

const PAINT_COLORS = ["#F5A623", "#22C7A9", "#E63946", "#1D3557", "#F1FAEE", "#0B0E11", "#8D99AE"];

export default function CarVisualizerCard({
  vehicle,
  onColorChange,
}: {
  vehicle: Vehicle;
  onColorChange: (hex: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [color, setColor] = useState(vehicle.color_hex);
  const [saving, setSaving] = useState(false);

  async function handlePick(hex: string) {
    setColor(hex);
    setSaving(true);
    try {
      await onColorChange(hex);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="panel p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-display text-base font-semibold text-dash-text">{t("car3d.title")}</h3>
          {vehicle.make && (
            <p className="text-xs text-dash-muted mt-0.5">
              {vehicle.make} {vehicle.model} · {vehicle.model_year} · {vehicle.trim}
            </p>
          )}
        </div>
        {saving && <Loader2 className="w-4 h-4 animate-spin text-dash-muted" />}
      </div>

      <div className="rounded-xl overflow-hidden border border-dash-line bg-dash-raised">
        <CarVisualizer3D colorHex={color} height={280} />
      </div>
      <p className="text-xs text-dash-muted text-center mt-2">{t("car3d.dragHint")}</p>

      <div className="mt-4">
        <p className="tap-label">{t("car3d.color")}</p>
        <div className="flex flex-wrap gap-2.5">
          {PAINT_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => handlePick(c)}
              aria-label={c}
              className={`w-9 h-9 rounded-full border-2 transition-transform ${
                color === c ? "border-gauge-amber scale-110" : "border-dash-line"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
