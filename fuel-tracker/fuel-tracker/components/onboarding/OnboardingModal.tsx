"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { getMakeNames, getModelsForMake, getYearsForModel, getTrimsForModel } from "@/lib/data/vehicleDatabase";
import { VehicleSpecUpdate } from "@/lib/types";
import { Check, ChevronLeft, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

// The 3D canvas pulls in three.js — keep it out of the initial bundle and
// only load it client-side, once the modal actually mounts.
const CarVisualizer3D = dynamic(() => import("@/components/CarVisualizer3D"), {
  ssr: false,
  loading: () => <div className="h-56 flex items-center justify-center text-dash-muted text-sm">Loading 3D preview…</div>,
});

const PAINT_COLORS = ["#F5A623", "#22C7A9", "#E63946", "#1D3557", "#F1FAEE", "#0B0E11", "#8D99AE"];

type Step = "make" | "model" | "year" | "trim" | "color";
const STEPS: Step[] = ["make", "model", "year", "trim", "color"];

export default function OnboardingModal({
  onComplete,
}: {
  onComplete: (spec: VehicleSpecUpdate) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [stepIndex, setStepIndex] = useState(0);
  const [make, setMake] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [trim, setTrim] = useState<string | null>(null);
  const [color, setColor] = useState(PAINT_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  const step = STEPS[stepIndex];
  const makes = useMemo(() => getMakeNames(), []);
  const models = useMemo(() => (make ? getModelsForMake(make) : []), [make]);
  const years = useMemo(() => (make && model ? getYearsForModel(make, model) : []), [make, model]);
  const trims = useMemo(() => (make && model ? getTrimsForModel(make, model) : []), [make, model]);

  const canAdvance =
    (step === "make" && !!make) ||
    (step === "model" && !!model) ||
    (step === "year" && !!year) ||
    (step === "trim" && !!trim) ||
    step === "color";

  function goNext() {
    if (stepIndex < STEPS.length - 1) setStepIndex((i) => i + 1);
  }
  function goBack() {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }

  async function handleFinish() {
    if (!make || !model || !year || !trim) return;
    setSubmitting(true);
    try {
      await onComplete({
        make,
        model,
        model_year: year,
        trim,
        color_hex: color,
        onboarded: true,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-lg bg-dash-surface border border-dash-line rounded-t-2xl sm:rounded-2xl max-h-[94vh] overflow-y-auto p-6 animate-rise">
        <div className="mb-5">
          <p className="text-xs font-medium text-gauge-amber uppercase tracking-wide mb-1">
            {t("onboarding.step", { current: stepIndex + 1, total: STEPS.length })}
          </p>
          <h2 className="font-display text-xl font-semibold">{t("onboarding.welcome")}</h2>
          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-dash-raised mt-3 overflow-hidden">
            <div
              className="h-full bg-gauge-amber transition-all duration-300"
              style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Live 3D preview once a color exists to show */}
        {(step === "trim" || step === "color") && (
          <div className="mb-5 rounded-xl overflow-hidden border border-dash-line bg-dash-raised">
            <CarVisualizer3D colorHex={color} height={200} interactive={step === "color"} />
          </div>
        )}

        {step === "make" && (
          <OptionGrid
            label={t("onboarding.make")}
            options={makes}
            selected={make}
            onSelect={(v) => {
              setMake(v);
              setModel(null);
              setYear(null);
              setTrim(null);
            }}
          />
        )}

        {step === "model" && (
          <OptionGrid
            label={t("onboarding.model")}
            options={models.map((m) => m.name)}
            selected={model}
            onSelect={(v) => {
              setModel(v);
              setYear(null);
              setTrim(null);
            }}
          />
        )}

        {step === "year" && (
          <OptionGrid
            label={t("onboarding.year")}
            options={years.map(String)}
            selected={year != null ? String(year) : null}
            onSelect={(v) => setYear(Number(v))}
          />
        )}

        {step === "trim" && (
          <OptionGrid
            label={t("onboarding.trim")}
            options={trims.map((tr) => tr.name)}
            selected={trim}
            onSelect={(v) => setTrim(v)}
          />
        )}

        {step === "color" && (
          <div>
            <label className="tap-label">{t("onboarding.color")}</label>
            <div className="flex flex-wrap gap-3 mt-2">
              {PAINT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  aria-label={c}
                  className={`w-11 h-11 rounded-full border-2 transition-transform ${
                    color === c ? "border-gauge-amber scale-110" : "border-dash-line"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mt-7">
          {stepIndex > 0 && (
            <button onClick={goBack} className="btn-secondary flex-1">
              <ChevronLeft className="w-4 h-4" /> {t("onboarding.back")}
            </button>
          )}
          {step !== "color" ? (
            <button onClick={goNext} disabled={!canAdvance} className="btn-primary flex-1">
              {t("onboarding.next")}
            </button>
          ) : (
            <button onClick={handleFinish} disabled={submitting} className="btn-primary flex-1">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {t("onboarding.finish")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function OptionGrid({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string | null;
  onSelect: (v: string) => void;
}) {
  return (
    <div>
      <label className="tap-label">{label}</label>
      <div className="grid grid-cols-2 gap-2.5 mt-1">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className={`px-4 py-3.5 rounded-xl text-sm font-medium border text-left transition-colors ${
              selected === opt
                ? "bg-gauge-amber text-dash-bg border-gauge-amber"
                : "bg-dash-raised text-dash-text border-dash-line"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
