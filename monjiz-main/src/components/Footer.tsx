import logo from "@/assets/monjiz-logo.png";

export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="container-mz py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Monjiz" className="h-7 w-7 object-contain" />
          <span dir="rtl">جميع الحقوق محفوظة © {new Date().getFullYear()} لمنصة مُنجز (MONJIZ)</span>
        </div>
        <div className="text-xs">Based in the heart of Egypt · صُنع في مصر</div>
      </div>
    </footer>
  );
}
