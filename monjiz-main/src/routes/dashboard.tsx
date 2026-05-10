import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getFreelancerByUserId, listProjectsByFreelancer, listClientRequestsByFreelancer, listProjectRequestsByFreelancer } from "@/integrations/data/vercel-api-client";
import { supabase } from "@/integrations/supabase-client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProjectsManager } from "@/components/ProjectsManager";
import { AdminSetupHelper } from "@/components/AdminSetupHelper";

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
  const [profile, setProfile] = useState<Freelancer | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate({ to: "/login" }); return; }
      try {
        const f = await getFreelancerByUserId(session.user.id);
        setProfile(f);
        if (f) {
          const [cr, pr, proj] = await Promise.all([
            listClientRequestsByFreelancer(f.id),
            listProjectRequestsByFreelancer(f.id),
            listProjectsByFreelancer(f.id),
          ]);
          const all = [...(cr as Request[]), ...(pr as Request[])]
            .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
          setRequests(all);
          setProjects(proj as Project[]);
        }
      } catch (error: any) {
        console.error("Failed to load dashboard data:", error);
      }
      setLoading(false);
    })();
  }, [navigate]);

  if (loading) return <Shell><div className="container-mz py-20 text-muted-foreground">Loading…</div></Shell>;

  if (!profile) return (
    <Shell>
      <div className="container-mz py-20 text-center">
        <h1 className="text-2xl font-bold mb-3">No freelancer profile yet</h1>
        <Link to="/signup" className="underline underline-offset-4">Complete onboarding →</Link>
      </div>
    </Shell>
  );

  return (
    <Shell>
      <main className="container-mz py-16 flex-1">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Freelancer</div>
            <h1 className="text-4xl font-black">{profile.name}</h1>
          </div>
          <StatusBadge status={profile.status} />
        </div>

        <div className="grid lg:grid-cols-3 gap-px bg-border border border-border mb-12">
          <Stat label="Specialty" value={profile.specialty} />
          <Stat label="Email" value={profile.email} />
          <Stat label="WhatsApp" value={profile.whatsapp} />
        </div>

        <div className="border border-border bg-card p-8 mb-12">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Portfolio</div>
          <div className="text-base">{profile.portfolio || <span className="text-muted-foreground">—</span>}</div>
        </div>

        <AdminSetupHelper />

        <div className="mb-12">
          <ProjectsManager 
            freelancerId={profile.id}
            projects={projects}
            onProjectsUpdate={setProjects}
          />
        </div>

        <section>
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl font-bold">Notifications & Project Invites</h2>
            <span className="text-sm text-muted-foreground">{requests.length} total</span>
          </div>
          {requests.length === 0 ? (
            <div className="border border-dashed border-border p-12 text-center text-muted-foreground">
              No project invites yet. Once activated, clients will reach out here.
            </div>
          ) : (
            <ul className="space-y-3">
              {requests.map((r) => (
                <li key={r.id} className="border border-border bg-card p-6">
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <div className="font-bold">{r.client_name}</div>
                    <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">{r.client_contact}</div>
                  {(r.project_type || r.budget || r.deadline) && (
                    <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                      {r.project_type && <div><span className="text-muted-foreground">Type · </span>{r.project_type}</div>}
                      {r.budget && <div><span className="text-muted-foreground">Budget · </span>{r.budget}</div>}
                      {r.deadline && <div><span className="text-muted-foreground">Deadline · </span>{r.deadline}</div>}
                    </div>
                  )}
                  {r.message && <p className="text-sm">{r.message}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
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
