import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Handles the redirect back from Supabase after an email confirmation or
// magic link is clicked (and Google OAuth too, if you re-enable it later).
// `origin` is read from the incoming request itself, so this always
// resolves to whatever domain actually served the request — localhost in
// dev, your real Vercel domain in prod — mirroring what
// `window.location.origin` gives you client-side in AuthForm.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
