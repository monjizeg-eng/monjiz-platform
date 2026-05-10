import { createFileRoute, Link } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { listFreelancersAll } from "@/integrations/data/vercel-api-client";
import { supabase } from "@/integrations/supabase-client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FreelancerManagementTable } from "@/components/FreelancerManagementTable";
import { AdminQuickReference } from "@/components/AdminQuickReference";
import { toast } from "sonner";

type Freelancer = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  specialty: string;
  status: string;
  created_at: string;
  bio: string | null;
  portfolio: string | null;
  linkedin: string | null;
  behance: string | null;
  github: string | null;
  profile_image: string | null;
  portfolio_images: string[] | null;
};

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — Monjiz" }] }),
  component: AdminPage,
});

function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [filter, setFilter] = useState<"pending" | "active" | "banned" | "all">("pending");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    banned: 0,
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await listFreelancersAll();
      setFreelancers(data as Freelancer[]);
      const allData = data as Freelancer[];
      setStats({
        total: allData.length,
        active: allData.filter((f) => f.status === "active").length,
        pending: allData.filter((f) => f.status === "pending").length,
        banned: allData.filter((f) => f.status === "banned").length,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to load freelancers");
    }
  };

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleRow) {
        setLoading(false);
        return;
      }

      setAuthorized(true);
      await load();
      setLoading(false);
    })();
  }, []);

  const signInAsAdmin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoading(true);

    if (email.trim().toLowerCase() !== "admin@admin.com" || password !== "admin") {
      setLoginError("Invalid email or password. Use admin@admin.com / admin.");
      setLoading(false);
      return;
    }

    setAuthorized(true);
    await load();
    setLoading(false);
  };

  if (loading) {
    return (
      <Shell>
        <div className="container-mz py-20 text-center text-muted-foreground">Loading…</div>
      </Shell>
    );
  }

  if (!authorized) {
    return (
      <Shell>
        <main className="container-mz py-16 flex-1">
          <div className="max-w-md mx-auto">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Admin access</div>
            <h1 className="text-4xl font-black mb-10">Admin sign in</h1>
            <form onSubmit={signInAsAdmin} className="border border-border bg-card p-8 space-y-5">
              <label className="block">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Email</div>
                <input
                  type="email"
                  required
                  autoComplete="username"
                  className="mz-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="block">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Password</div>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  className="mz-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              {loginError ? <p className="text-sm text-red-500">{loginError}</p> : null}
              <button type="submit" className="w-full px-6 py-3 bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                Sign in →
              </button>
              <p className="text-sm text-center text-muted-foreground">Use <span className="font-semibold">admin@admin.com</span> for email and <span className="font-semibold">admin</span> for password.</p>
              <p className="text-sm text-center text-muted-foreground">
                Or <Link to="/login" className="underline underline-offset-4 text-primary">sign in with your account</Link> if you already have one.
              </p>
            </form>
          </div>
        </main>
      </Shell>
    );
  }

  return (
    <Shell>
      <main className="container-mz py-16 flex-1">
        {/* Header */}
        <div className="mb-10">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Administration</div>
          <h1 className="text-4xl font-black mb-1">Freelancer Management</h1>
          <p className="text-muted-foreground">Monitor, approve, edit, and manage all freelancer profiles on the platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total Freelancers" value={stats.total} color="bg-blue-500/10" />
          <StatCard label="Active" value={stats.active} color="bg-green-500/10" />
          <StatCard label="Pending Review" value={stats.pending} color="bg-yellow-500/10" />
          <StatCard label="Banned" value={stats.banned} color="bg-red-500/10" />
        </div>

        {/* Quick Reference */}
        <AdminQuickReference />

        {/* Management Table */}
        <div className="bg-card border border-border rounded-lg p-6">
          <FreelancerManagementTable
            freelancers={freelancers}
            filter={filter}
            setFilter={setFilter}
            onUpdate={load}
          />
        </div>
      </main>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      {children}
      <Footer />
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`${color} border border-border/40 p-4 rounded-lg`}>
      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{label}</div>
      <div className="text-3xl font-black">{value}</div>
    </div>
  );
}
