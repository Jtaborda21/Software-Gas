"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Fuel, Loader2 } from "lucide-react";

type Mode = "sign-in" | "sign-up";

export default function AuthForm() {
  const supabase = createClient();
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/dashboard";
      } else {
        // window.location.origin is resolved at click-time in the browser,
        // so this always points at whatever domain the app is actually
        // running on (localhost while developing, your real Vercel domain
        // in production) — the confirmation link Supabase emails never
        // points at the wrong environment.
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        setNotice(t("auth.checkInbox"));
        setMode("sign-in");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex justify-end mb-3">
        <LanguageSwitcher />
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gauge-amber/10 border border-gauge-amber/30 flex items-center justify-center mb-4">
          <Fuel className="w-7 h-7 text-gauge-amber" strokeWidth={2} />
        </div>
        <h1 className="font-display text-2xl font-semibold text-dash-text">{t("app.name")}</h1>
        <p className="text-dash-muted text-sm mt-1">{t("app.tagline")}</p>
      </div>

      <div className="panel p-6">
        <div className="flex rounded-xl bg-dash-raised p-1 mb-6 border border-dash-line">
          {(["sign-in", "sign-up"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                mode === m ? "bg-gauge-amber text-dash-bg" : "text-dash-muted"
              }`}
            >
              {m === "sign-in" ? t("auth.signIn") : t("auth.signUp")}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="tap-label" htmlFor="email">{t("auth.email")}</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="tap-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="tap-label" htmlFor="password">{t("auth.password")}</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              className="tap-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-gauge-red">{error}</p>}
          {notice && <p className="text-sm text-gauge-teal">{notice}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "sign-in" ? t("auth.signIn") : t("auth.createAccount")}
          </button>
        </form>
      </div>
    </div>
  );
}
