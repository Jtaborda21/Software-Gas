# Fuel Tracker

A mobile-first Progressive Web App for logging fill-ups and tracking fuel
efficiency and running costs, built with Next.js 14 (App Router), Tailwind
CSS, Supabase (Auth + Postgres), and Recharts.

## 1. Stack

| Layer          | Choice                                             |
|----------------|-----------------------------------------------------|
| Frontend       | Next.js 14 App Router + TypeScript + Tailwind CSS   |
| Auth + DB      | Supabase (Postgres + Row Level Security + Auth)     |
| Charts         | Recharts                                             |
| PWA            | Web manifest + service worker (app-shell caching)   |

Supabase was chosen over plain Firebase because the data here is relational
(vehicles → refuel records) and benefits from SQL, Postgres views for
derived metrics, and Row Level Security policies that are easy to audit.
The same app would work almost unchanged against Firebase/Firestore if you
prefer — swap `lib/supabase/*` for a Firestore client and the security
rules in `supabase/schema.sql` for Firestore rules.

## 2. Project structure

```
fuel-tracker/
├── app/
│   ├── layout.tsx            # root layout, fonts, PWA meta, SW registration
│   ├── page.tsx               # redirects to /login or /dashboard
│   ├── login/page.tsx          # sign in / sign up screen
│   ├── dashboard/page.tsx      # main app: filters, charts, history, form
│   └── auth/callback/route.ts  # OAuth / magic-link callback handler
├── components/
│   ├── AuthForm.tsx            # email+password and Google OAuth
│   ├── RefuelForm.tsx          # data entry (bottom sheet on mobile)
│   ├── SummaryCards.tsx        # spend / efficiency / cost-per-km cards
│   ├── FuelGauge.tsx           # signature SVG dashboard-style gauge
│   ├── ConsumptionChart.tsx    # monthly spend bars + efficiency line
│   ├── Filters.tsx             # month / year / custom range filter bar
│   └── HistoryTable.tsx        # responsive table ↔ stacked cards
├── lib/
│   ├── supabase/client.ts      # browser client
│   ├── supabase/server.ts      # server component client
│   ├── calculations.ts         # pure functions: efficiency, aggregation
│   └── types.ts
├── middleware.ts                # session refresh + route protection
├── public/
│   ├── manifest.json            # PWA manifest
│   └── sw.js                    # offline app-shell cache
├── supabase/schema.sql          # tables, RLS policies, triggers, view
└── tailwind.config.ts            # design tokens (dash/gauge palette)
```

## 3. Database schema

Two tables, both protected by Row Level Security so a user can only ever
see their own rows:

- **`vehicles`** — one row per car (`distance_unit`, `volume_unit`,
  `currency`, `tank_bars` for the gauge). A trigger auto-creates a default
  vehicle the moment a user signs up, so the dashboard always has
  something to attach records to.
- **`refuel_records`** — one row per fill-up: `volume`, `total_cost`,
  `odometer`, `trip_distance`, `gauge_bars_before`, `is_full_tank`.

A Postgres view, `refuel_records_enriched`, derives `distance_per_volume`
(km/L), `volume_per_100` (L/100km) and `cost_per_distance` server-side —
the same math also lives in `lib/calculations.ts` so the client can
recompute instantly while filtering, without a round trip.

Efficiency uses the standard **full-to-full method**: it's only computed
when `is_full_tank = true`, since a partial fill-up doesn't represent a
complete consumption cycle. The entry form defaults this checkbox to on.

Run `supabase/schema.sql` once in the Supabase SQL editor (or
`supabase db push` with the CLI) against a fresh project.

## 4. Setup

```bash
npx create-next-app@latest --typescript   # or just clone this folder
cd fuel-tracker
npm install
cp .env.local.example .env.local
```

Fill in `.env.local` with your Supabase project's URL and anon key
(Project Settings → API in the Supabase dashboard):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
```

Then in the Supabase dashboard:
1. **SQL Editor** → paste and run `supabase/schema.sql`.
2. **Authentication → Providers** → enable Email, and enable Google if you
   want the OAuth button (add your app's URL to the redirect allow-list:
   `https://yourdomain.com/auth/callback`).
3. **Authentication → URL Configuration** → set Site URL to your deployed
   domain (or `http://localhost:3000` while developing).

Run locally:

```bash
npm run dev
```

## 5. PWA / "installable on any phone" checklist

- `public/manifest.json` defines the name, icons, and standalone display
  mode needed for "Add to Home Screen" on iOS and Android.
- `public/sw.js` is a minimal app-shell cache, registered from
  `app/layout.tsx`, so the last-viewed dashboard still opens with a weak
  signal at the pump. Data operations (add/delete/sync) still require
  connectivity, since they go straight to Supabase.
- Replace the placeholder paths in `public/icons/` with real
  192×192 and 512×512 PNG icons before shipping (any square logo works —
  export from Figma/Canva at those two sizes).
- Deploy anywhere that serves Next.js (Vercel is the zero-config option);
  the app is responsive from ~360px phones up to desktop, so no separate
  mobile build is needed.

## 6. Extending

- **Multiple vehicles**: the schema already supports it — add a vehicle
  switcher in the dashboard header and pass the selected `vehicle.id`
  through instead of always querying the first one.
- **CSV export**: `enrichRecords()` in `lib/calculations.ts` already gives
  you every derived field; piping that array through a CSV writer for a
  filtered range is a small addition to `HistoryTable`.
- **Firebase instead of Supabase**: keep every component as-is and
  replace only `lib/supabase/*` and the two `supabase.from(...)` calls in
  `app/dashboard/page.tsx` with Firestore equivalents; the data shape in
  `lib/types.ts` maps cleanly onto Firestore documents.
