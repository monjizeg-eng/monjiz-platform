import logo from "@/assets/monjiz-logo.png";

export function Footer() {
  return (
    <footer className="bg-white text-primary border-t border-primary/20 mt-24">
      <div className="container-mz py-10 flex flex-col lg:flex-row items-center justify-between gap-6 text-sm">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Monjiz" className="h-7 w-7 object-contain" />
          <div>
            <div className="uppercase text-[11px] tracking-[0.3em] opacity-70">monjiz</div>
            <div dir="rtl" className="text-xs">جميع الحقوق محفوظة © {new Date().getFullYear()} لمنصة مُنجز (MONJIZ)</div>
            <div className="text-xs mt-1">Contact: +201556554537</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em]">
          <a href="/" className="px-3 py-2 border border-primary/20 hover:bg-primary/10 transition">home</a>
          <a href="/contact" className="px-3 py-2 border border-primary/20 hover:bg-primary/10 transition">contact us</a>
          <a href="/signup" className="px-3 py-2 border border-primary/20 hover:bg-primary/10 transition">join as a freelancer</a>
          <a href="/marketplace" className="px-3 py-2 border border-primary/20 hover:bg-primary/10 transition">request a special task</a>
        </div>
      </div>
    </footer>
  );
}
