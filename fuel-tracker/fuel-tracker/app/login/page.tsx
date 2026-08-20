import AuthForm from "@/components/AuthForm";

// AuthForm creates a Supabase browser client on render. Without this,
// Next.js may try to prerender this page at build time, before env vars
// are guaranteed to be available, which throws "Invalid URL".
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <AuthForm />
    </main>
  );
}
