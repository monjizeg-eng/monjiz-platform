import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-freelancers.jpg";
import { useEffect, useState } from "react";
import { listFreelancersAll } from "@/integrations/data/vercel-api-client";
import { PLACEHOLDER_FREELANCERS } from "@/integrations/data/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Monjiz · منجز — اختر أحسن المنجزين لإنجاز أعمالك عن بُعد" },
      { name: "description", content: "Monjiz — منصة مصرية تربط أصحاب الأعمال بنخبة المستقلين في التصميم، تطوير الويب، أتمتة الذكاء الاصطناعي والتسويق. ادفع بأمان عبر InstaPay أو Vodafone Cash." },
      { property: "og:title", content: "Monjiz · منجز" },
      { property: "og:description", content: "اختار احسن المنجزين لانجاز اعمالك عن بُعد." },
    ],
  }),
  component: Index,
});

const categories = [
  { en: "Visual Content & Design", ar: "المحتوى البصري والتصميم", key: "Graphic Design" },
  { en: "Website Developers", ar: "تطوير المواقع", key: "Web Development" },
  { en: "AI Automation", ar: "أتمتة الذكاء الاصطناعي", key: "AI Automation" },
  { en: "Business Support & Micro-Tasks", ar: "دعم الأعمال والمهام الصغيرة", key: "Marketing" },
];

const steps = [
  { n: "01", en: "Choose your service", ar: "اختر خدمتك", desc: "تصفح أقسامنا واختر الخبرة التي تحتاجها، أو قم بنشر مهمة خاصة." },
  { n: "02", en: "Match with a pro", ar: "تواصل مع محترف", desc: "سنقوم بتوصيلك بمقدم خدمة \"منجز\" موثق يناسب ميزانيتك وجدولك الزمني." },
  { n: "03", en: "Get results", ar: "احصل على النتائج", desc: "استلم عملك بجودة عالية وادفع بأمان عبر إنستا باي أو فودافون كاش." },
];

const why = [
  { en: "Local expertise", ar: "خبرة محلية", desc: "مواهبنا تفهم السوق المصري، والثقافة، واللغة العامية." },
  { en: "Speed", ar: "السرعة", desc: "لا فترات انتظار 14 يومًا — تركيزنا الأساسي إنجاز المهام الآن." },
  { en: "Vetted quality", ar: "جودة موثقة", desc: "لا نسمح لأي شخص بالانضمام؛ نراجع كل سابقة أعمال يدويًا لتوفير وقتك." },
];

type Talent = { id: string; name: string; specialty: string; bio: string | null; profile_image: string | null };

function Index() {
  const [talents, setTalents] = useState<Talent[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await listFreelancersAll();
        const rows = data.filter((f: any) => f.status === "active" && f.bio).slice(0, 3) as Talent[];
        setTalents(rows.length ? rows : PLACEHOLDER_FREELANCERS.slice(0, 3));
      } catch (error) {
        setTalents(PLACEHOLDER_FREELANCERS.slice(0, 3));
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <img
          src={heroImg}
          alt="Freelancers collaborating in a sunlit workspace"
          width={1920}
          height={1024}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/85" />
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
             style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.14) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="container-mz relative py-24 sm:py-36 text-primary-foreground">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-foreground/10 backdrop-blur border border-primary-foreground/20 text-xs uppercase tracking-widest mb-8">
              <span className="h-1.5 w-1.5 bg-primary-foreground rounded-full" /> Made in Egypt · صُنع في مصر
            </div>
            <h1 dir="rtl" className="font-black text-4xl sm:text-6xl leading-[1.1] mb-10">
              اختار أحسن المنجزين <br/>
              لإنجاز أعمالك عن بُعد
            </h1>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/marketplace" className="group inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary-foreground text-primary font-medium hover:opacity-90 transition">
                Request a Task
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link to="/signup" className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-transparent border border-primary-foreground text-primary-foreground font-medium hover:bg-primary-foreground/10 transition">
                Join as a Freelancer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR SERVICES / CATEGORIES */}
      <section className="container-mz py-24">
        <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">01 — Popular Services</div>
            <h2 className="text-3xl sm:text-4xl font-black">Our freelancers will take it from here</h2>
          </div>
          <div dir="rtl" className="text-muted-foreground text-lg">الخدمات الأكثر طلبًا</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
          {categories.map((s, i) => (
            <Link
              key={s.en}
              to="/marketplace"
              search={{ specialty: s.key }}
              className="bg-background p-8 hover:bg-secondary transition-colors group block"
            >
              <div className="text-xs text-muted-foreground mb-8">0{i + 1}</div>
              <div className="text-xl font-bold mb-2 group-hover:underline underline-offset-4">{s.en}</div>
              <div dir="rtl" className="text-muted-foreground">{s.ar}</div>
              <div className="text-xs uppercase tracking-widest text-primary mt-6 opacity-0 group-hover:opacity-100 transition-opacity">Available tasks →</div>
            </Link>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/marketplace" className="px-5 py-3 border border-border text-sm hover:bg-secondary">Request a specific task →</Link>
          <Link to="/marketplace" className="px-5 py-3 border border-border text-sm hover:bg-secondary">Browse available tasks →</Link>
        </div>
      </section>

      {/* TOP FREELANCERS */}
      {talents.length > 0 && (
        <section className="border-y border-border bg-secondary/40">
          <div className="container-mz py-24">
            <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">02 — Roster</div>
                <h2 className="text-3xl sm:text-4xl font-black">Our top freelancers</h2>
              </div>
              <Link to="/marketplace" className="text-sm underline underline-offset-4">View all →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {talents.map((t) => (
                <Link key={t.id} to="/freelancer/$id" params={{ id: t.id }} className="bg-background border border-border group flex flex-col">
                  <div className="aspect-[4/3] bg-secondary overflow-hidden">
                    {t.profile_image ? (
                      <img src={t.profile_image} alt={t.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-black text-5xl text-primary/40">
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{t.specialty}</div>
                    <h3 className="text-xl font-bold mb-2">{t.name}</h3>
                    {t.bio && <p className="text-sm text-muted-foreground line-clamp-2">{t.bio}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="container-mz py-24">
        <div className="mb-12">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">03 — How It Works</div>
          <h2 className="text-3xl sm:text-4xl font-black">Three steps, no friction</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-px bg-border border border-border">
          {steps.map((s) => (
            <div key={s.n} className="bg-background p-8">
              <div className="text-5xl font-black text-primary/20 mb-6">{s.n}</div>
              <div className="text-xl font-bold mb-1">{s.en}</div>
              <div dir="rtl" className="text-sm text-muted-foreground mb-4">{s.ar}</div>
              <p dir="rtl" className="text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="bg-primary text-primary-foreground">
        <div className="container-mz py-24">
          <div className="mb-12">
            <div className="text-xs uppercase tracking-widest opacity-60 mb-3">04 — Why Monjiz</div>
            <h2 className="text-3xl sm:text-4xl font-black">Why Choose Monjiz</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {why.map((w) => (
              <div key={w.en}>
                <div className="text-2xl font-black mb-1">{w.en}</div>
                <div dir="rtl" className="text-sm opacity-60 mb-4">{w.ar}</div>
                <p dir="rtl" className="opacity-90 leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW TO PAY */}
      <section className="container-mz py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">05 — Payments</div>
            <h2 className="text-3xl sm:text-4xl font-black mb-6">How to Pay</h2>
            <p dir="rtl" className="text-muted-foreground leading-relaxed">
              تتم معالجة المدفوعات بأمان عبر إنستا باي (InstaPay) أو فودافون كاش (Vodafone Cash). وبمجرد اكتمال مهمتك ورضاك التام عن النتيجة، ستتلقى تعليمات الدفع.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-border p-8 text-center hover:bg-secondary transition">
              <div className="font-black text-xl tracking-tight">InstaPay</div>
              <div className="text-xs text-muted-foreground mt-2">Instant bank transfer</div>
            </div>
            <div className="border border-border p-8 text-center hover:bg-secondary transition">
              <div className="font-black text-xl tracking-tight">Vodafone Cash</div>
              <div className="text-xs text-muted-foreground mt-2">Mobile wallet</div>
            </div>
          </div>
        </div>
      </section>

      {/* READY CTA */}
      <section className="border-y border-border" style={{ background: "var(--gradient-warm)" }}>
        <div className="container-mz py-24 text-center">
          <h2 className="text-4xl sm:text-5xl font-black mb-4">Ready to get things done?</h2>
          <p dir="rtl" className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            انضم إلى مئات الشركات المصرية التي تتقدم وتنمو مع "منجز".
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/marketplace" className="px-6 py-4 bg-primary text-primary-foreground font-medium hover:opacity-90 transition">Request a Task →</Link>
            <Link to="/signup" className="px-6 py-4 bg-background border border-primary text-primary font-medium hover:bg-secondary transition">Join as a Freelancer</Link>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="container-mz py-24">
        <div className="grid md:grid-cols-[1fr_2fr] gap-12">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">06 — About</div>
            <h2 className="text-3xl font-black leading-tight">Based in the heart of Egypt</h2>
          </div>
          <div className="space-y-5 text-muted-foreground leading-relaxed">
            <p dir="rtl">
              يعمل "منجز" على سد الفجوة بين المواهب المحلية والشركات من خلال التحدث بلغتهم، ثقافيًا وماليًا. ومن خلال العمل محليًا، نتخلص من العقبات المعقدة التي تفرضها المنصات الدولية، مثل رسوم تحويل العملات المرتفعة وبوابات الدفع العالمية المقيدة.
            </p>
            <p dir="rtl">
              بالنسبة للمستقلين، يعني هذا استلام المدفوعات بسرعة وأمان من خلال وسائل مألوفة مثل فودافون كاش أو التحويلات البنكية المحلية، مما يضمن لهم الحفاظ على قدر أكبر من أرباحهم. وبالنسبة للعملاء، يوفر "منجز" راحة البال بفضل الدعم المحلي، والفهم الثقافي المشترك، وعملية مبسطة مصممة خصيصًا لتلبية الاحتياجات الفريدة للسوق المصري.
            </p>
            <p dir="rtl" className="pt-4 border-t border-border text-foreground">
              كيف يضمن موقع منجز حقوقك؟ — مراجعة يدوية لكل مستقل، ودفع آمن عبر InstaPay وVodafone Cash.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
