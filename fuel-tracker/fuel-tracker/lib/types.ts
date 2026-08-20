export type DistanceUnit = "km" | "mi";
export type VolumeUnit = "L" | "gal";

export interface Vehicle {
  id: string;
  user_id: string;
  name: string;
  distance_unit: DistanceUnit;
  volume_unit: VolumeUnit;
  currency: string;
  tank_bars: number;
  make: string | null;
  model: string | null;
  model_year: number | null;
  trim: string | null;
  color_hex: string;
  onboarded: boolean;
  created_at: string;
}

export interface VehicleSpecUpdate {
  make: string;
  model: string;
  model_year: number;
  trim: string;
  color_hex: string;
  onboarded: true;
}

export interface RefuelRecord {
  id: string;
  user_id: string;
  vehicle_id: string;
  refuel_at: string; // ISO timestamp
  volume: number;
  total_cost: number;
  odometer: number | null;
  trip_distance: number | null;
  gauge_bars_before: number | null;
  is_full_tank: boolean;
  notes: string | null;
  created_at: string;
}

export interface RefuelRecordInput {
  refuel_at: string;
  volume: number;
  total_cost: number;
  odometer?: number | null;
  trip_distance?: number | null;
  gauge_bars_before?: number | null;
  is_full_tank: boolean;
  notes?: string | null;
}

export interface RefuelWithMetrics extends RefuelRecord {
  distancePerVolume: number | null; // km/L or mi/gal
  volumePer100: number | null;      // L/100km — null for mi/gal vehicles
  costPerDistance: number | null;
}
