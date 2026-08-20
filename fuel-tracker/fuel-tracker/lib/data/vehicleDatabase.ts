/**
 * A small curated vehicle database so onboarding is 100% selection, no
 * free typing. Extend this list with more makes/models/trims as needed —
 * the cascading dropdowns in OnboardingModal are driven entirely by this
 * shape, so no component code needs to change to add more vehicles.
 */
export interface TrimSpec {
  name: string;
  tankBars: number; // how many bars this trim's fuel gauge has (for the gauge picker)
}
export interface ModelSpec {
  name: string;
  years: number[];
  trims: TrimSpec[];
}
export interface MakeSpec {
  name: string;
  models: ModelSpec[];
}

export const vehicleDatabase: MakeSpec[] = [
  {
    name: "Chevrolet",
    models: [
      {
        name: "Spark GT",
        years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
        trims: [
          { name: "1.2L MT LT", tankBars: 8 },
          { name: "1.2L AT Premier", tankBars: 8 },
        ],
      },
      {
        name: "Onix",
        years: [2020, 2021, 2022, 2023, 2024, 2025],
        trims: [
          { name: "1.0L Turbo LT", tankBars: 8 },
          { name: "1.0L Turbo Premier", tankBars: 8 },
        ],
      },
      {
        name: "Tracker",
        years: [2021, 2022, 2023, 2024, 2025],
        trims: [
          { name: "1.2L Turbo LS", tankBars: 8 },
          { name: "1.2L Turbo Premier AWD", tankBars: 8 },
        ],
      },
    ],
  },
  {
    name: "Renault",
    models: [
      {
        name: "Sandero",
        years: [2019, 2020, 2021, 2022, 2023, 2024],
        trims: [
          { name: "1.6L Life", tankBars: 8 },
          { name: "1.6L Intens", tankBars: 8 },
        ],
      },
      {
        name: "Duster",
        years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
        trims: [
          { name: "1.6L 4x2 Zen", tankBars: 8 },
          { name: "2.0L 4x4 Intens", tankBars: 8 },
        ],
      },
      {
        name: "Logan",
        years: [2019, 2020, 2021, 2022, 2023],
        trims: [{ name: "1.6L Dynamique", tankBars: 8 }],
      },
    ],
  },
  {
    name: "Toyota",
    models: [
      {
        name: "Corolla",
        years: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
        trims: [
          { name: "1.8L XLI CVT", tankBars: 8 },
          { name: "2.0L XEI CVT", tankBars: 8 },
          { name: "Hybrid SEG", tankBars: 8 },
        ],
      },
      {
        name: "Hilux",
        years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
        trims: [
          { name: "2.4L Diesel 4x2", tankBars: 8 },
          { name: "2.8L Diesel 4x4 SRX", tankBars: 8 },
        ],
      },
      {
        name: "RAV4",
        years: [2020, 2021, 2022, 2023, 2024, 2025],
        trims: [
          { name: "2.5L AWD LE", tankBars: 8 },
          { name: "Hybrid AWD Limited", tankBars: 8 },
        ],
      },
    ],
  },
  {
    name: "Mazda",
    models: [
      {
        name: "Mazda2",
        years: [2019, 2020, 2021, 2022, 2023],
        trims: [{ name: "1.5L Touring AT", tankBars: 8 }],
      },
      {
        name: "Mazda3",
        years: [2019, 2020, 2021, 2022, 2023, 2024],
        trims: [
          { name: "2.0L Touring", tankBars: 8 },
          { name: "2.5L Grand Touring", tankBars: 8 },
        ],
      },
      {
        name: "CX-30",
        years: [2020, 2021, 2022, 2023, 2024, 2025],
        trims: [
          { name: "2.0L Touring FWD", tankBars: 8 },
          { name: "2.5L Grand Touring AWD", tankBars: 8 },
        ],
      },
    ],
  },
  {
    name: "Kia",
    models: [
      {
        name: "Picanto",
        years: [2019, 2020, 2021, 2022, 2023, 2024],
        trims: [{ name: "1.0L EX", tankBars: 8 }, { name: "1.2L GT-Line", tankBars: 8 }],
      },
      {
        name: "Sportage",
        years: [2020, 2021, 2022, 2023, 2024, 2025],
        trims: [
          { name: "2.0L LX FWD", tankBars: 8 },
          { name: "2.0L EX AWD", tankBars: 8 },
        ],
      },
      {
        name: "Rio",
        years: [2019, 2020, 2021, 2022, 2023],
        trims: [{ name: "1.4L EX", tankBars: 8 }],
      },
    ],
  },
  {
    name: "Ford",
    models: [
      {
        name: "Ranger",
        years: [2019, 2020, 2021, 2022, 2023, 2024],
        trims: [
          { name: "2.2L Diesel XL 4x2", tankBars: 8 },
          { name: "3.2L Diesel Wildtrak 4x4", tankBars: 8 },
        ],
      },
      {
        name: "Escape",
        years: [2020, 2021, 2022, 2023],
        trims: [{ name: "1.5L EcoBoost SE", tankBars: 8 }],
      },
    ],
  },
];

export function getMakeNames(): string[] {
  return vehicleDatabase.map((m) => m.name);
}
export function getModelsForMake(make: string): ModelSpec[] {
  return vehicleDatabase.find((m) => m.name === make)?.models ?? [];
}
export function getYearsForModel(make: string, model: string): number[] {
  return getModelsForMake(make).find((m) => m.name === model)?.years ?? [];
}
export function getTrimsForModel(make: string, model: string): TrimSpec[] {
  return getModelsForMake(make).find((m) => m.name === model)?.trims ?? [];
}
