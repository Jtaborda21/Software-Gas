"use client";

import { useTranslation } from "@/lib/i18n/LanguageContext";
import { Languages } from "lucide-react";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div
      className="flex items-center gap-1 rounded-lg border border-dash-line bg-dash-raised p-1"
      role="group"
      aria-label={t("nav.language")}
    >
      <Languages className="w-3.5 h-3.5 text-dash-muted ml-1.5" />
      {(["es", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`px-2 py-1 text-xs font-semibold rounded-md uppercase transition-colors ${
            locale === l ? "bg-gauge-amber text-dash-bg" : "text-dash-muted"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
