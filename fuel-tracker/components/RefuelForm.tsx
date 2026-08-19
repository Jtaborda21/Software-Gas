"use client";

import { useState } from "react";
import { Vehicle, RefuelRecordInput } from "@/lib/types";
import { X, Loader2 } from "lucide-react";

function nowForInput() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm for <input type="datetime-local">
}

export default function RefuelForm({
  vehicle,
  onSubmit,
  onClose,
}: {
  vehicle: Vehicle;
  onSubmit: (input: RefuelRecordInput) => Promise<void>;
  onClose: () => void;
}) {
  const [datetime, setDatetime] = useState(nowForInput());
  const [volume, setVolume] = useState("");
  const [cost, setCost] = useState("");
  const [gaugeBefore, setGaugeBefore] = useState<number | "">("");
  const [distanceMode, setDistanceMode] = useState<"trip" | "odometer">("trip");
  const [tripDistance, setTripDistance] = useState("");
  const [odometer, setOdometer] = useState("");
  const [isFullTank, setIsFullTank] = useState(true);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const volumeNum = parseFloat(volume);
    const costNum = parseFloat(cost);
    if (!volumeNum || volumeNum <= 0) return setError("Enter how much fuel you added.");
    if (isNaN(costNum) || costNum < 0) return setError("Enter the total cost.");
    if (distanceMode === "trip" && tripDistance && parseFloat(tripDistance) < 0) {
      return setError("Distance can't be negative.");
    }

    setSubmitting(true);
    try {
      await onSubmit({
        refuel_at: new Date(datetime).toISOString(),
        volume: volumeNum,
        total_cost: costNum,
        gauge_bars_before: gaugeBefore === "" ? null : Number(gaugeBefore),
        trip_distance: distanceMode === "trip" && tripDistance ? parseFloat(tripDistance) : null,
        odometer: distanceMode === "odometer" && odometer ? parseFloat(odometer) : null,
        is_full_tank: isFullTank,
        notes: notes || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save this record.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full sm:max-w-md bg-dash-surface border border-dash-line rounded-t-2xl sm:rounded-2xl
                   max-h-[92vh] overflow-y-auto p-5 sm:p-6 animate-rise"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold">New fill-up</h2>
          <button type="button" onClick={onClose} className="p-2 -mr-2 text-dash-muted hover:text-dash-text">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="tap-label" htmlFor="datetime">Date &amp; time</label>
            <input
              id="datetime"
              type="datetime-local"
              className="tap-input"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="tap-label" htmlFor="volume">Fuel added ({vehicle.volume_unit})</label>
              <input
                id="volume"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                className="tap-input"
                placeholder="0.00"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="tap-label" htmlFor="cost">Total cost ({vehicle.currency})</label>
              <input
                id="cost"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                className="tap-input"
                placeholder="0.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="tap-label">Fuel gauge before refueling</label>
            <div className="grid grid-cols-9 gap-1.5">
              {Array.from({ length: vehicle.tank_bars + 1 }, (_, i) => i).map((bar) => (
                <button
                  type="button"
                  key={bar}
                  onClick={() => setGaugeBefore(bar)}
                  className={`aspect-square rounded-lg text-xs font-mono flex items-center justify-center border transition-colors ${
                    gaugeBefore === bar
                      ? "bg-gauge-amber text-dash-bg border-gauge-amber"
                      : "bg-dash-raised text-dash-muted border-dash-line"
                  }`}
                >
                  {bar}
                </button>
              ))}
            </div>
            <p className="text-xs text-dash-muted mt-1.5">Bars showing on the dashboard right before you filled up.</p>
          </div>

          <div>
            <div className="flex rounded-xl bg-dash-raised p-1 border border-dash-line mb-3">
              <button
                type="button"
                onClick={() => setDistanceMode("trip")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  distanceMode === "trip" ? "bg-gauge-amber text-dash-bg" : "text-dash-muted"
                }`}
              >
                Trip distance
              </button>
              <button
                type="button"
                onClick={() => setDistanceMode("odometer")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  distanceMode === "odometer" ? "bg-gauge-amber text-dash-bg" : "text-dash-muted"
                }`}
              >
                Odometer reading
              </button>
            </div>

            {distanceMode === "trip" ? (
              <div>
                <label className="tap-label" htmlFor="trip">
                  Distance since last fill-up ({vehicle.distance_unit})
                </label>
                <input
                  id="trip"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min="0"
                  className="tap-input"
                  placeholder="0"
                  value={tripDistance}
                  onChange={(e) => setTripDistance(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <label className="tap-label" htmlFor="odo">Total odometer ({vehicle.distance_unit})</label>
                <input
                  id="odo"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min="0"
                  className="tap-input"
                  placeholder="0"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                />
                <p className="text-xs text-dash-muted mt-1.5">
                  Trip distance will be derived from your previous odometer reading.
                </p>
              </div>
            )}
          </div>

          <label className="flex items-center gap-3 py-1">
            <input
              type="checkbox"
              checked={isFullTank}
              onChange={(e) => setIsFullTank(e.target.checked)}
              className="w-5 h-5 rounded accent-gauge-amber"
            />
            <span className="text-sm text-dash-text">This was a full tank fill-up</span>
          </label>
          <p className="text-xs text-dash-muted -mt-2">
            Efficiency is calculated from full-tank to full-tank, so leave this checked for accurate km/L.
          </p>

          <div>
            <label className="tap-label" htmlFor="notes">Notes (optional)</label>
            <input
              id="notes"
              type="text"
              className="tap-input"
              placeholder="Premium, road trip, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-gauge-red">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full mt-2">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Save fill-up
          </button>
        </div>
      </form>
    </div>
  );
}
