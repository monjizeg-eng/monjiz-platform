import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { supabase } from "@/integrations/supabase-client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";

const ADMIN_EMAIL = "admin@admin.com";
const ADMIN_ALIAS_PASSWORD = "admin";
const ADMIN_REAL_PASSWORD = "admin123!";

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

    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail === ADMIN_EMAIL && password === ADMIN_ALIAS_PASSWORD) {
      try {
        // Try to sign in admin, create if doesn't exist
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_REAL_PASSWORD,
        });

        if (signInError) {
          // Try to create admin account
          const { error: signUpError } = await supabase.auth.signUp({
            email: ADMIN_EMAIL,
            password: ADMIN_REAL_PASSWORD,
          });

          if (signUpError && !signUpError.message.includes("already")) {
            throw signUpError;
          }

          // Try sign in again after potential creation
          const { error: retryError } = await supabase.auth.signInWithPassword({
            email: ADMIN_EMAIL,
            password: ADMIN_REAL_PASSWORD,
          });

          if (retryError) throw retryError;
        }

        toast.success("Welcome admin");
        navigate({ to: "/admin" });
        return;
      } catch (error: any) {
        toast.error(error.message || "Admin sign in failed");
        return;
      } finally {
        setLoading(false);
      }
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      toast.success("Welcome back");
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        if (roleRow) {
          navigate({ to: "/admin" });
          return;
        }
      }
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
          <form onSubmit={submit} noValidate className="border border-border bg-card p-8 space-y-5">
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
