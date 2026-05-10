import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { authSignIn } from "@/integrations/data/vercel-api-client";
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

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (email.trim().toLowerCase() === "admin@admin.com" && password === "admin") {
      toast.success("Welcome admin");
      navigate({ to: "/admin" });
      setLoading(false);
      return;
    }

    try {
      await authSignIn(email, password);
      toast.success("Welcome back");
      navigate({ to: "/dashboard" });
    } catch (error: any) {
      toast.error(error.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
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
            <p className="text-sm text-center text-muted-foreground">Admin access also works with <span className="font-semibold">admin@admin.com</span> / <span className="font-semibold">admin</span>.</p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
