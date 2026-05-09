import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { localDb } from "@/integrations/data/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — Monjiz" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await localDb.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container-mz py-16 flex-1">
        <div className="max-w-md mx-auto">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Account</div>
          <h1 className="text-4xl font-black mb-10">Sign in</h1>
          <form onSubmit={submit} className="border border-border bg-card p-8 space-y-5">
            <label className="block">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Email</div>
              <input type="email" required className="mz-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="block">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Password</div>
              <input type="password" required className="mz-input" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <button disabled={loading} className="w-full px-6 py-3 bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {loading ? "Signing in…" : "Sign in →"}
            </button>
            <p className="text-sm text-center text-muted-foreground">
              No account? <Link to="/signup" className="underline underline-offset-4 text-primary">Join Monjiz</Link>
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
