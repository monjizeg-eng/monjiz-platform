import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase-client";
import logo from "@/assets/monjiz-logo.png";

const ADMIN_EMAIL = "admin@admin.com";

export function Header() {
  const [authed, setAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const checkAdmin = async (userId: string | undefined, email?: string | null) => {
    if (!userId && email !== ADMIN_EMAIL) {
      setIsAdmin(false);
      return;
    }

    if (email === ADMIN_EMAIL) {
      setIsAdmin(true);
      return;
    }

    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    setIsAdmin(!!data);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      checkAdmin(data.session?.user.id, data.session?.user.email);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setAuthed(!!s);
      checkAdmin(s?.user.id, s?.user.email);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground border-b border-primary/20">
      <div className="container-mz flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em]">
          <img src={logo} alt="Monjiz" className="h-8 w-8 object-contain" />
          <span>monjiz</span>
        </Link>
        <nav className="hidden md:flex items-center gap-2 text-xs uppercase tracking-[0.15em]">
          <Link to="/marketplace" className="px-3 py-2 hover:bg-white/10 transition">Visual Content & Design</Link>
          <Link to="/marketplace" search={{ specialty: "Web Development" }} className="px-3 py-2 hover:bg-white/10 transition">website developers</Link>
          <Link to="/marketplace" search={{ specialty: "Marketing" }} className="px-3 py-2 hover:bg-white/10 transition">Business Support & Micro-Tasks</Link>
        </nav>
        <div className="flex items-center gap-2">
          {authed ? (
            <>
              {isAdmin && <Link to="/dashboard" className="px-3 py-2 border border-white/15 hover:bg-white/10 transition">Dashboard</Link>}
              <button onClick={logout} className="px-3 py-2 border border-white/15 hover:bg-white/10 transition">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 border border-white/15 hover:bg-white/10 transition">Login</Link>
              <Link to="/signup" className="px-3 py-2 border border-white bg-white text-primary font-semibold hover:bg-white/90 transition">Join</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
