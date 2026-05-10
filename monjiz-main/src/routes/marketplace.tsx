import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { listFreelancersAll } from "@/integrations/data/vercel-api-client";
import { PLACEHOLDER_FREELANCERS } from "@/integrations/data/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";

type Freelancer = {
  id: string; name: string; specialty: string;
  profile_image: string | null;
  bio: string | null;
};

const SPECIALTIES = ["All", "Graphic Design", "Web Development", "AI Automation", "Marketing"];

export const Route = createFileRoute("/marketplace")({
  validateSearch: (search: Record<string, unknown>) => ({
    specialty: typeof search.specialty === "string" ? search.specialty : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Marketplace — Monjiz" },
      { name: "description", content: "Browse Monjiz's curated roster of freelance designers, developers, AI engineers and marketers." },
    ],
  }),
  component: Marketplace,
});

function Marketplace() {
  const [list, setList] = useState<Freelancer[]>([]);
  const { specialty } = Route.useSearch();
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>(specialty && SPECIALTIES.includes(specialty) ? specialty : "All");

  useEffect(() => {
    (async () => {
      try {
        const data = await listFreelancersAll();
        const rows = data.filter((f: any) => f.status === "active" && f.bio) as Freelancer[];
        setList(rows.length ? rows : PLACEHOLDER_FREELANCERS);
      } catch (error: any) {
        toast.error(error.message || "Failed to load freelancers");
        setList(PLACEHOLDER_FREELANCERS);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => list.filter((f) => {
    const matchQ = !q || f.name.toLowerCase().includes(q.toLowerCase()) || f.specialty.toLowerCase().includes(q.toLowerCase());
    const matchF = filter === "All" || f.specialty === filter;
    return matchQ && matchF;
  }), [list, q, filter]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="border-b border-border" style={{ background: "var(--gradient-warm)" }}>
          <div className="container-mz py-16">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Directory</div>
            <h1 className="text-4xl sm:text-5xl font-black mb-3">Hire elite talent</h1>
            <p className="text-muted-foreground max-w-xl">Every freelancer is reviewed and activated by the Monjiz team.</p>
          </div>
        </section>

        <div className="container-mz py-10">
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <input className="mz-input flex-1" placeholder="Search by name or specialty…" value={q} onChange={(e) => setQ(e.target.value)} />
            <div className="flex gap-1 overflow-x-auto">
              {SPECIALTIES.map((s) => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-4 py-2 text-sm whitespace-nowrap border transition ${filter === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading talent…</div>
          ) : filtered.length === 0 ? (
            <div className="border border-dashed border-border p-16 text-center text-muted-foreground">
              No freelancers match your search yet. The roster is growing — check back soon.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((f) => (
                <article key={f.id} className="border border-border bg-card group flex flex-col">
                  <div className="aspect-[4/3] bg-secondary overflow-hidden">
                    {f.profile_image ? (
                      <img src={f.profile_image} alt={f.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-black text-5xl text-primary/40">
                        {f.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{f.specialty}</div>
                    <h3 className="text-xl font-bold mb-3">{f.name}</h3>
                    {f.bio && <p className="text-sm text-muted-foreground line-clamp-2 mb-6">{f.bio}</p>}
                    <Link to="/freelancer/$id" params={{ id: f.id }} className="mt-auto px-4 py-3 bg-primary text-primary-foreground text-sm hover:opacity-90 transition text-center">
                      View Details →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
