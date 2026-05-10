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
        <div className="absolute inset-0 bg-black/65" />
        <div className="container-mz relative py-24 sm:py-36">
          <div className="max-w-4xl">
            <div className="text-xs uppercase tracking-[0.35em] text-white/70 mb-4">monjiz</div>
            <h1 className="font-black text-5xl sm:text-6xl leading-[1.03] text-white max-w-3xl">
              Hire elite freelancers for faster, local work in Egypt.
            </h1>
            <p className="mt-6 max-w-2xl text-sm text-white/75">
              Connect with vetted designers, developers, and business support specialists ready to deliver high-quality results on your terms.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link to="/marketplace" className="inline-flex items-center justify-center px-6 py-4 bg-white text-primary font-semibold border border-primary/20 hover:bg-secondary/15 transition hover:-translate-y-0.5">
                Explore freelancers
              </Link>
              <Link to="/signup" className="inline-flex items-center justify-center px-6 py-4 border border-primary text-primary bg-transparent font-semibold hover:bg-secondary/10 transition">
                join as a freelancer
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background text-primary py-6">
        <div className="container-mz flex flex-wrap justify-center gap-3">
          {categories.map((s) => (
            <Link
              key={s.en}
              to="/marketplace"
              search={{ specialty: s.key }}
              className="px-4 py-3 bg-white text-primary border border-secondary/20 uppercase tracking-[0.15em] text-xs font-semibold hover:bg-secondary/10 hover:-translate-y-0.5 transition"
            >
              {s.en}
            </Link>
          ))}
        </div>
      </section>

      {/* POPULAR SERVICES / CATEGORIES */}
      <section className="container-mz py-24 bg-background">
        <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">popular services</div>
            <h2 className="text-3xl sm:text-4xl font-black">The services clients need most</h2>
          </div>
          <div dir="rtl" className="text-muted-foreground text-lg">الخدمات الأكثر طلبًا</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((s) => (
            <div key={s.en} className="bg-white border border-secondary/20 p-8 text-center hover:-translate-y-0.5 hover:shadow-[0_15px_40px_-30px_rgba(48,48,51,0.55)] transition">
              <div className="mb-4 h-12 w-12 mx-auto flex items-center justify-center text-primary text-xl">•</div>
              <div className="text-lg font-bold mb-2">{s.en}</div>
              <div dir="rtl" className="text-sm text-muted-foreground">{s.ar}</div>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Link to="/marketplace" className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white border border-primary font-medium uppercase tracking-[0.15em] hover:bg-primary/90 transition">
            Explore services
          </Link>
        </div>
      </section>

      {/* TOP FREELANCERS */}
      {talents.length > 0 && (
        <section className="bg-background text-primary py-24">
          <div className="container-mz">
            <div className="text-center mb-12">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Our top freelancers</div>
              <h2 className="text-5xl sm:text-6xl font-black">Our top freelancers</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {talents.map((t) => (
                <Link key={t.id} to="/freelancer/$id" params={{ id: t.id }} className="bg-white border border-secondary/20 group flex flex-col overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-[0_20px_35px_-30px_rgba(48,48,51,0.45)]">
                  <div className="aspect-[4/3] bg-secondary/10 overflow-hidden">
                    {t.profile_image ? (
                      <img src={t.profile_image} alt={t.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-black text-5xl text-primary/40">
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="text-sm uppercase tracking-[0.2em] text-secondary mb-1">{t.specialty}</div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-primary">{t.name}</h3>
                    {t.bio && <p className="text-base text-muted-foreground line-clamp-2">{t.bio}</p>}
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
      <section className="border-y border-border bg-background">
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
