import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  const navigate = useNavigate();
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
        navigate({ to: "/login" });
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
  }, [navigate]);

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
        <div className="container-mz py-20 text-center">
          <h1 className="text-2xl font-bold mb-3">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have permission to access the admin panel.</p>
          <Link to="/dashboard" className="underline underline-offset-4">
            Go to dashboard →
          </Link>
        </div>
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
