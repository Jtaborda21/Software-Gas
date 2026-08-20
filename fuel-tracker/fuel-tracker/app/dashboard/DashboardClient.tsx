"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { RefuelRecord, RefuelRecordInput, Vehicle, VehicleSpecUpdate } from "@/lib/types";
import { enrichRecords, filterByDateRange, groupByMonth, recordsInMonth } from "@/lib/calculations";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import SummaryCards from "@/components/SummaryCards";
import ConsumptionChart from "@/components/ConsumptionChart";
import HistoryTable from "@/components/HistoryTable";
import Filters, { FilterState } from "@/components/Filters";
import RefuelForm from "@/components/RefuelForm";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CarVisualizerCard from "@/components/CarVisualizerCard";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import { Fuel, LogOut, Plus, Loader2 } from "lucide-react";

export default function DashboardClient() {
  const supabase = useMemo(() => createClient(), []);
  const { t } = useTranslation();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [records, setRecords] = useState<RefuelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<FilterState>({ mode: "all" });
  const [userEmail, setUserEmail] = useState<string>("");

  const loadData = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserEmail(user.email ?? "");

    const { data: vehicles } = await supabase
      .from("vehicles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1);

    const v = vehicles?.[0] as Vehicle | undefined;
    setVehicle(v ?? null);

    if (v) {
      const { data: recs } = await supabase
        .from("refuel_records")
        .select("*")
        .eq("vehicle_id", v.id)
        .order("refuel_at", { ascending: false });
      setRecords((recs as RefuelRecord[]) ?? []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleAddRecord(input: RefuelRecordInput) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !vehicle) throw new Error("Not signed in.");

    // Derive trip distance from odometer if the user entered odometer instead.
    let trip_distance = input.trip_distance;
    if (trip_distance == null && input.odometer != null) {
      const previous = records[0]; // most recent record (records are sorted desc)
      if (previous?.odometer != null) {
        trip_distance = Math.max(0, input.odometer - previous.odometer);
      }
    }

    const { error } = await supabase.from("refuel_records").insert({
      user_id: user.id,
      vehicle_id: vehicle.id,
      refuel_at: input.refuel_at,
      volume: input.volume,
      total_cost: input.total_cost,
      odometer: input.odometer,
      trip_distance,
      gauge_bars_before: input.gauge_bars_before,
      is_full_tank: input.is_full_tank,
      notes: input.notes,
    });
    if (error) throw error;
    await loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm(t("history.delete") + "?")) return;
    await supabase.from("refuel_records").delete().eq("id", id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function handleOnboardingComplete(spec: VehicleSpecUpdate) {
    if (!vehicle) return;
    const { error } = await supabase
      .from("vehicles")
      .update({
        make: spec.make,
        model: spec.model,
        model_year: spec.model_year,
        trim: spec.trim,
        color_hex: spec.color_hex,
        onboarded: true,
        name: `${spec.make} ${spec.model}`,
      })
      .eq("id", vehicle.id);
    if (error) throw error;
    await loadData();
  }

  async function handleColorChange(hex: string) {
    if (!vehicle) return;
    setVehicle({ ...vehicle, color_hex: hex }); // optimistic update
    await supabase.from("vehicles").update({ color_hex: hex }).eq("id", vehicle.id);
  }

  const filteredRecords = useMemo(() => {
    if (filter.mode === "all") return records;
    if (filter.mode === "month") return recordsInMonth(records, filter.year, filter.month);
    if (filter.mode === "year") return records.filter((r) => new Date(r.refuel_at).getFullYear() === filter.year);
    return filterByDateRange(records, filter.from, filter.to);
  }, [records, filter]);

  const enrichedFiltered = useMemo(() => enrichRecords(filteredRecords), [filteredRecords]);
  const enrichedAll = useMemo(() => enrichRecords(records), [records]);
  const thisMonthRecords = useMemo(() => {
    const now = new Date();
    return enrichRecords(recordsInMonth(records, now.getFullYear(), now.getMonth()));
  }, [records]);
  const monthlyChartData = useMemo(() => groupByMonth(records), [records]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gauge-amber" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center text-dash-muted text-sm px-4 text-center">
        Couldn&apos;t load your vehicle. Try refreshing, or contact support if this persists.
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      <header className="sticky top-0 z-30 backdrop-blur bg-dash-bg/80 border-b border-dash-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gauge-amber/10 border border-gauge-amber/30 flex items-center justify-center">
              <Fuel className="w-4.5 h-4.5 text-gauge-amber" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-base font-semibold leading-tight truncate">{vehicle.name}</h1>
              <p className="text-xs text-dash-muted leading-tight truncate">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <LanguageSwitcher />
            <button
              onClick={handleSignOut}
              className="text-dash-muted hover:text-dash-text p-2 rounded-lg transition-colors"
              aria-label={t("nav.signOut")}
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <SummaryCards monthRecords={thisMonthRecords} allRecords={enrichedAll} vehicle={vehicle} />
        {vehicle.onboarded && <CarVisualizerCard vehicle={vehicle} onColorChange={handleColorChange} />}
        <ConsumptionChart data={monthlyChartData} vehicle={vehicle} />
        <Filters value={filter} onChange={setFilter} />
        <HistoryTable records={enrichedFiltered} vehicle={vehicle} onDelete={handleDelete} />
      </main>

      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 sm:right-10 btn-primary rounded-full !px-6 shadow-lg shadow-gauge-amber/20"
      >
        <Plus className="w-5 h-5" /> {t("form.logFillUp")}
      </button>

      {showForm && (
        <RefuelForm vehicle={vehicle} onSubmit={handleAddRecord} onClose={() => setShowForm(false)} />
      )}

      {!vehicle.onboarded && <OnboardingModal onComplete={handleOnboardingComplete} />}
    </div>
  );
}
