import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { localDb } from "@/integrations/data/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProjectGallery } from "@/components/ProjectGallery";
import { toast } from "sonner";
import { MAX_SHOWCASE_PROJECTS } from "@/lib/showcase-constants";

type Freelancer = {
  id: string; name: string; specialty: string;
  profile_image: string | null;
  portfolio_images: string[] | null;
  bio: string | null;
  portfolio: string | null;
  linkedin: string | null;
  behance: string | null;
  github: string | null;
};

type Project = {
  id: string;
  title: string;
  description: string | null;
  images: string[] | null;
  created_at: string;
};

export const Route = createFileRoute("/freelancer/$id")({
  head: () => ({ meta: [{ title: "Freelancer — Monjiz" }] }),
  component: FreelancerProfile,
});

function FreelancerProfile() {
  const { id } = Route.useParams();
  const [f, setF] = useState<Freelancer | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await localDb
        .from("freelancers")
        .select("id,name,specialty,profile_image,portfolio_images,bio,portfolio,linkedin,behance,github")
        .eq("id", id)
        .eq("status", "active")
        .maybeSingle();
      if (error) toast.error(error.message);
      setF(data as Freelancer | null);

      // Fetch projects
      const { data: projectsData, error: projectsError } = await localDb
        .from("projects")
        .select("id,title,description,images,created_at")
        .eq("freelancer_id", id)
        .order("created_at", { ascending: true });
      if (projectsError) toast.error(projectsError.message);
      const list = (projectsData ?? []) as Project[];
      setProjects(list.slice(0, MAX_SHOWCASE_PROJECTS));
      
      setLoading(false);
    })();
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {loading ? (
          <div className="container-mz py-32 text-center text-muted-foreground">Loading profile…</div>
        ) : !f ? (
          <div className="container-mz py-32 text-center">
            <h1 className="text-2xl font-bold mb-3">Freelancer not found</h1>
            <Link to="/marketplace" className="underline underline-offset-4">Back to marketplace →</Link>
          </div>
        ) : (
          <>
            <section className="border-b border-border" style={{ background: "var(--gradient-warm)" }}>
              <div className="container-mz py-16 grid md:grid-cols-[240px_1fr] gap-10 items-start">
                <div className="aspect-square w-full max-w-[240px] bg-background border border-border overflow-hidden">
                  {f.profile_image ? (
                    <img src={f.profile_image} alt={f.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-black text-7xl text-primary/40">
                      {f.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{f.specialty}</div>
                  <h1 className="text-4xl sm:text-5xl font-black mb-6">{f.name}</h1>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {f.linkedin && <a href={f.linkedin} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs uppercase tracking-widest border border-border bg-background hover:bg-secondary">LinkedIn</a>}
                    {f.behance && <a href={f.behance} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs uppercase tracking-widest border border-border bg-background hover:bg-secondary">Behance</a>}
                    {f.github && <a href={f.github} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs uppercase tracking-widest border border-border bg-background hover:bg-secondary">GitHub</a>}
                    {f.portfolio && <a href={f.portfolio} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs uppercase tracking-widest border border-border bg-background hover:bg-secondary">Portfolio</a>}
                  </div>
                  <button onClick={() => setOpen(true)} className="px-6 py-4 bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                    Request a Quote →
                  </button>
                </div>
              </div>
            </section>

            <section className="container-mz py-16">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">About</div>
              <p className="text-lg leading-relaxed max-w-3xl whitespace-pre-line">{f.bio || "—"}</p>
            </section>

            {projects.length > 0 && <ProjectGallery projects={projects} />}

            {projects.length === 0 && f.portfolio_images && f.portfolio_images.length > 0 && (
              <section className="container-mz pb-24">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-6">Portfolio</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {f.portfolio_images.map((src, i) => (
                    <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="block aspect-[4/3] bg-secondary overflow-hidden border border-border">
                      <img src={src} alt={`Work ${i + 1}`} className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" />
                    </a>
                  ))}
                </div>
              </section>
            )}

            {open && <QuoteModal freelancer={f} onClose={() => setOpen(false)} />}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

const quoteSchema = z.object({
  client_name: z.string().trim().min(2).max(80),
  client_contact: z.string().trim().min(5).max(120),
  project_type: z.string().trim().min(2).max(120),
  budget: z.string().trim().min(1).max(60),
  deadline: z.string().trim().min(1).max(60),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

function QuoteModal({ freelancer, onClose }: { freelancer: Freelancer; onClose: () => void }) {
  const [form, setForm] = useState({
    client_name: "", client_contact: "",
    project_type: "", budget: "", deadline: "", message: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { quoteSchema.parse(form); }
    catch (err: any) { return toast.error(err.errors?.[0]?.message ?? "Please complete the form"); }
    setLoading(true);
    const { error } = await localDb.from("client_requests").insert({
      freelancer_id: freelancer.id, ...form,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setDone(true);
  };

  return (
    <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background border border-border max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <PaymentSuccess freelancerName={freelancer.name} onClose={onClose} />
        ) : (
          <form onSubmit={submit} className="p-8">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Request Quote</div>
            <h3 className="text-2xl font-bold mb-6">Brief {freelancer.name}</h3>
            <div className="space-y-4">
              <input className="mz-input" placeholder="Your name" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
              <input className="mz-input" placeholder="Email or WhatsApp" value={form.client_contact} onChange={(e) => setForm({ ...form, client_contact: e.target.value })} />
              <input className="mz-input" placeholder="Project type (e.g. Logo design, Landing page)" value={form.project_type} onChange={(e) => setForm({ ...form, project_type: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input className="mz-input" placeholder="Budget (EGP / USD)" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
                <input className="mz-input" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              </div>
              <textarea className="mz-input min-h-28" placeholder="Project details (optional)…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-6 border-t border-border">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm hover:bg-secondary">Cancel</button>
              <button disabled={loading} className="px-6 py-3 bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
                {loading ? "Sending…" : "Send Request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function PaymentSuccess({ freelancerName, onClose }: { freelancerName: string; onClose: () => void }) {
  return (
    <div className="p-10 text-center">
      <div className="mx-auto h-16 w-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-6 text-3xl">✓</div>
      <h3 className="text-2xl font-bold mb-2">Request Sent</h3>
      <p className="text-muted-foreground mb-8">{freelancerName} will be notified. Once you agree on terms, settle securely with:</p>
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="border border-border p-5 hover:bg-secondary transition">
          <div className="font-black text-lg tracking-tight">InstaPay</div>
          <div className="text-xs text-muted-foreground mt-1">Instant bank transfer</div>
        </div>
        <div className="border border-border p-5 hover:bg-secondary transition">
          <div className="font-black text-lg tracking-tight">Vodafone Cash</div>
          <div className="text-xs text-muted-foreground mt-1">Mobile wallet</div>
        </div>
      </div>
      <button onClick={onClose} className="px-6 py-3 bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 w-full">
        Done
      </button>
    </div>
  );
}
