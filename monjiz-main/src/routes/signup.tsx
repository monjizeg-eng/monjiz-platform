import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { insertFreelancer } from "@/integrations/data/vercel-api-client";
import { supabase } from "@/integrations/supabase-client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Join Monjiz — Freelancer Onboarding" }] }),
  component: SignupPage,
});

const SPECIALTIES = ["Graphic Design", "Web Development", "AI Automation", "Marketing"] as const;

const step1Schema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  email: z.string().trim().email("Invalid email").max(255),
  whatsapp: z.string().trim().min(6, "Invalid number").max(30),
});
const step2Schema = z.object({
  specialty: z.enum(SPECIALTIES),
  bio: z.string().trim().min(20, "Tell clients a bit more about you (20+ chars)").max(2000),
});
const step3Schema = z.object({
  password: z.string().min(8, "At least 8 characters").max(72),
});

type FormState = {
  name: string; email: string; whatsapp: string;
  specialty: typeof SPECIALTIES[number];
  bio: string; portfolio: string;
  linkedin: string; behance: string; github: string;
  password: string;
  profileImage: File | null;
  portfolioImages: File[];
};

function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FormState>({
    name: "", email: "", whatsapp: "",
    specialty: "Graphic Design",
    bio: "", portfolio: "",
    linkedin: "", behance: "", github: "",
    password: "",
    profileImage: null,
    portfolioImages: [],
  });

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const next = () => {
    try {
      if (step === 1) step1Schema.parse(data);
      if (step === 2) {
        step2Schema.parse(data);
        if (data.portfolioImages.length < 3) throw new Error("Please upload at least 3 portfolio images");
        if (data.portfolioImages.length > 5) throw new Error("Please upload at most 5 portfolio images");
      }
      setStep(step + 1);
    } catch (e: any) {
      toast.error(e.errors?.[0]?.message ?? e.message ?? "Please complete the step");
    }
  };

  const uploadFile = async (userId: string, file: File, kind: "headshot" | "portfolio", idx?: number) => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${kind}-${Date.now()}-${idx ?? 0}.${ext}`;
    const { error } = await supabase.storage.from("freelancer-media").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("freelancer-media").getPublicUrl(path);
    return data.publicUrl;
  };

  const submit = async () => {
    try {
      step3Schema.parse(data);
    } catch (e: any) {
      toast.error(e.errors?.[0]?.message ?? "Invalid password");
      return;
    }
    setLoading(true);
    try {
      // Sign up with Supabase directly
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
      });

      if (signUpError) throw signUpError;

      const userId = authData.user?.id;
      if (!userId) {
        throw new Error("Could not create your account. Please try again.");
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email.trim(),
          password: data.password,
        });
        if (signInError) {
          throw new Error(
            signInError.message ||
              "Account created but sign-in failed. Try signing in from the login page.",
          );
        }
      }

      let profileUrl: string | null = null;
      if (data.profileImage) profileUrl = await uploadFile(userId, data.profileImage, "headshot");

      const portfolioUrls: string[] = [];
      for (let i = 0; i < data.portfolioImages.length; i++) {
        const url = await uploadFile(userId, data.portfolioImages[i], "portfolio", i);
        portfolioUrls.push(url);
      }

      await insertFreelancer({
        user_id: userId,
        name: data.name,
        email: data.email,
        whatsapp: data.whatsapp,
        specialty: data.specialty,
        portfolio: data.portfolio || null,
        bio: data.bio,
        profile_image: profileUrl,
        portfolio_images: portfolioUrls,
        linkedin: data.linkedin || null,
        behance: data.behance || null,
        github: data.github || null,
        status: "pending",
      });

      toast.success("Welcome to Monjiz! Your profile is pending approval.");
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      toast.error(e.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container-mz py-16 flex-1">
        <div className="max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Onboarding · Step {step} of 3</div>
          <h1 className="text-4xl font-black mb-10">Join Monjiz</h1>

          <div className="flex gap-1 mb-10">
            {[1, 2, 3].map((n) => (
              <div key={n} className={`h-1 flex-1 ${n <= step ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>

          <div className="border border-border bg-card p-8">
            {step === 1 && (
              <div className="space-y-5">
                <Field label="Full Name">
                  <input className="mz-input" value={data.name} onChange={(e) => set("name", e.target.value)} placeholder="Layla Ahmed" />
                </Field>
                <Field label="Email">
                  <input type="email" className="mz-input" value={data.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" />
                </Field>
                <Field label="WhatsApp Number">
                  <input className="mz-input" value={data.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+20 ..." />
                </Field>
                <Field label="Profile Headshot (optional)">
                  <ImagePicker file={data.profileImage} onChange={(f) => set("profileImage", f)} />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <Field label="Specialty">
                  <div className="grid grid-cols-2 gap-2">
                    {SPECIALTIES.map((s) => (
                      <button key={s} type="button" onClick={() => set("specialty", s)}
                        className={`p-3 text-sm border text-left transition ${data.specialty === s ? "border-primary bg-secondary" : "border-border hover:border-primary/40"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="About Me — Professional Bio">
                  <textarea className="mz-input min-h-32" value={data.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Senior product designer with 8 years building interfaces for fintech and e-commerce…" />
                </Field>
                <Field label="Portfolio Gallery (3–5 images)">
                  <MultiImagePicker files={data.portfolioImages} onChange={(f) => set("portfolioImages", f)} max={5} />
                </Field>
                <Field label="Portfolio link (optional)">
                  <input className="mz-input" value={data.portfolio} onChange={(e) => set("portfolio", e.target.value)} placeholder="https://yoursite.com" />
                </Field>
                <div className="grid sm:grid-cols-3 gap-3">
                  <Field label="LinkedIn">
                    <input className="mz-input" value={data.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="linkedin.com/in/…" />
                  </Field>
                  <Field label="Behance">
                    <input className="mz-input" value={data.behance} onChange={(e) => set("behance", e.target.value)} placeholder="behance.net/…" />
                  </Field>
                  <Field label="GitHub">
                    <input className="mz-input" value={data.github} onChange={(e) => set("github", e.target.value)} placeholder="github.com/…" />
                  </Field>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <Field label="Password">
                  <input type="password" className="mz-input" value={data.password} onChange={(e) => set("password", e.target.value)} placeholder="At least 8 characters" />
                </Field>
                <p className="text-xs text-muted-foreground">By creating an account you agree to Monjiz's review process. Your profile will be Pending until activated.</p>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              {step > 1 ? (
                <button onClick={() => setStep(step - 1)} className="px-4 py-2 text-sm hover:bg-secondary">← Back</button>
              ) : <Link to="/login" className="px-4 py-2 text-sm text-muted-foreground hover:text-primary">Already a member?</Link>}
              {step < 3 ? (
                <button onClick={next} className="px-6 py-3 bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Continue →</button>
              ) : (
                <button onClick={submit} disabled={loading} className="px-6 py-3 bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
                  {loading ? "Creating account…" : "Create account"}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{label}</div>
      {children}
    </label>
  );
}

function ImagePicker({ file, onChange }: { file: File | null; onChange: (f: File | null) => void }) {
  const preview = file ? URL.createObjectURL(file) : null;
  return (
    <div className="flex items-center gap-4">
      <div className="h-20 w-20 border border-border bg-secondary overflow-hidden flex items-center justify-center">
        {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <span className="text-xs text-muted-foreground">No image</span>}
      </div>
      <label className="px-4 py-2 border border-border text-sm cursor-pointer hover:bg-secondary">
        {file ? "Change" : "Upload"}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
      </label>
      {file && <button type="button" onClick={() => onChange(null)} className="text-xs text-muted-foreground underline">Remove</button>}
    </div>
  );
}

function MultiImagePicker({ files, onChange, max }: { files: File[]; onChange: (f: File[]) => void; max: number }) {
  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
        {files.map((f, i) => (
          <div key={i} className="relative aspect-square border border-border overflow-hidden bg-secondary">
            <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
            <button type="button" onClick={() => onChange(files.filter((_, idx) => idx !== i))}
              className="absolute top-1 right-1 h-6 w-6 bg-primary text-primary-foreground text-xs">×</button>
          </div>
        ))}
        {files.length < max && (
          <label className="aspect-square border border-dashed border-border flex items-center justify-center text-2xl text-muted-foreground cursor-pointer hover:bg-secondary">
            +
            <input type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => {
                const newFiles = Array.from(e.target.files ?? []);
                onChange([...files, ...newFiles].slice(0, max));
              }} />
          </label>
        )}
      </div>
      <div className="text-xs text-muted-foreground">{files.length} / {max} images · upload 3 minimum</div>
    </div>
  );
}
