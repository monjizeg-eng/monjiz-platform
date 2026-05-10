import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase-client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

type Freelancer = {
  id: string; name: string; email: string; whatsapp: string;
  specialty: string; portfolio: string | null; status: string;
};
type Request = {
  id: string; client_name: string; client_contact: string;
  project_type?: string | null; budget?: string | null; deadline?: string | null;
  message: string | null; status: string; created_at: string;
};
type Project = {
  id: string;
  title: string;
  description: string | null;
  images: string[] | null;
  freelancer_id: string;
  created_at: string;
};

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Monjiz" }] }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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

      setIsAdmin(!!roleRow);
      setLoading(false);

      if (!roleRow) {
        return;
      }
    })();
  }, [navigate]);

  if (loading) return <Shell><div className="container-mz py-20 text-muted-foreground">Loading…</div></Shell>;

  if (!isAdmin) return (
    <Shell>
      <div className="container-mz py-20 text-center">
        <h1 className="text-2xl font-bold mb-3">Admin Only</h1>
        <p className="text-muted-foreground mb-4">This dashboard is only available to users with admin access.</p>
        <Link to="/admin" className="underline underline-offset-4">Go to admin sign-in →</Link>
      </div>
    </Shell>
  );

  return (
    <Shell>
      <main className="container-mz py-16 flex-1">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Admin</div>
          <h1 className="text-4xl font-black mb-4">Admin Dashboard</h1>
          <p className="text-muted-foreground">You are signed in with admin access. Use the admin panel to manage freelancers and projects.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <Card title="Admin access" value="Granted" />
          <Card title="Dashboard visibility" value="Admin only" />
          <Card title="Manage users" value="Use /admin" />
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <Link to="/admin" className="inline-flex items-center justify-center w-full rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
            Open admin panel
          </Link>
        </div>
      </main>
    </Shell>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="border border-border bg-background p-6 rounded-lg">
      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background p-6">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{label}</div>
      <div className="font-medium break-all">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const active = status === "active";
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs uppercase tracking-widest border ${active ? "bg-primary text-primary-foreground border-primary" : "border-border bg-secondary"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-primary-foreground" : "bg-primary animate-pulse"}`} />
      {status}
    </div>
  );
}
