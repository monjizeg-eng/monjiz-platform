import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase-client";
import { getFreelancerByUserId, listProjectsByFreelancer } from "@/integrations/data/vercel-api-client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

type Freelancer = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  specialty: string;
  portfolio: string | null;
  status: string;
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
  head: () => ({ meta: [{ title: "Dashboard - Monjiz" }] }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

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

      const admin = !!roleRow;
      setIsAdmin(admin);

      if (!admin) {
        try {
          const freelancerData = await getFreelancerByUserId(session.user.id);
          const currentFreelancer = freelancerData as Freelancer;
          setFreelancer(currentFreelancer);

          const projectsData = await listProjectsByFreelancer(currentFreelancer.id);
          setProjects(projectsData as Project[]);
        } catch {
          setFreelancer(null);
          setProjects([]);
        }
      }

      setLoading(false);
    })();
  }, [navigate]);

  if (loading) {
    return (
      <Shell>
        <div className="container-mz py-20 text-muted-foreground">Loading...</div>
      </Shell>
    );
  }

  if (!isAdmin && !freelancer) {
    return (
      <Shell>
        <div className="container-mz py-20 text-center">
          <h1 className="text-2xl font-bold mb-3">Freelancer dashboard</h1>
          <p className="text-muted-foreground mb-4">
            This dashboard is for freelancers only. Create or complete your profile to access freelancer tools.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-5 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90"
          >
            Create freelancer profile
          </Link>
        </div>
      </Shell>
    );
  }

  if (isAdmin) {
    return (
      <Shell>
        <main className="container-mz py-16 flex-1">
          <div className="mb-10">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Admin</div>
            <h1 className="text-4xl font-black mb-4">Admin Dashboard</h1>
            <p className="text-muted-foreground">Use the admin panel to manage freelancers and platform data.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className="border border-border bg-background p-6 rounded-xl">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Admin access</div>
              <div className="text-2xl font-semibold">Granted</div>
            </div>
            <Link
              to="/admin"
              className="border border-border bg-primary text-white p-6 rounded-xl flex flex-col justify-between hover:bg-primary/95 transition"
            >
              <div>
                <div className="text-xs uppercase tracking-widest text-white/80 mb-2">Admin panel</div>
                <div className="text-2xl font-semibold">Open admin panel</div>
              </div>
              <div className="text-sm text-white/80 mt-4">Manage freelancers and projects</div>
            </Link>
          </div>
        </main>
      </Shell>
    );
  }

  return (
    <Shell>
      <main className="container-mz py-16 flex-1">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Freelancer</div>
          <h1 className="text-4xl font-black mb-4">Welcome back, {freelancer.name}</h1>
          <p className="text-muted-foreground">
            This is your freelancer dashboard. Use the links below to manage your profile and active work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/freelancer/$id"
            params={{ id: freelancer.id }}
            className="block border border-border bg-background p-6 rounded-xl hover:shadow-lg transition"
          >
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Profile</div>
            <div className="text-2xl font-semibold mb-1">View your public profile</div>
            <div className="text-sm text-muted-foreground">Edit your portfolio and service page.</div>
          </Link>

          <div className="border border-border bg-background p-6 rounded-xl hover:shadow-lg transition">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Active projects</div>
            <div className="text-2xl font-semibold mb-1">{projects.length}</div>
            <div className="text-sm text-muted-foreground">Current projects assigned to your profile.</div>
          </div>
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
