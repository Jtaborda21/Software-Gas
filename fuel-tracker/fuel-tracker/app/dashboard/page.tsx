import DashboardClient from "./DashboardClient";

// This route reads the Supabase session/env at request time, not build
// time — force-dynamic stops Next.js from trying to prerender it during
// `next build`, which is what caused the "Invalid URL" build error.
export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return <DashboardClient />;
}
