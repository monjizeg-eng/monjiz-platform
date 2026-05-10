import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase-client";
import logo from "@/assets/monjiz-logo.png";

export function Header() {
  const [authed, setAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const checkAdmin = async (userId: string | undefined) => {
    if (!userId) { setIsAdmin(false); return; }
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    setIsAdmin(!!data);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      checkAdmin(data.session?.user.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setAuthed(!!s);
      checkAdmin(s?.user.id);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container-mz flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Monjiz" className="h-9 w-9 object-contain" />
          <span className="font-black text-xl tracking-tight">Monjiz</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">منجز</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 text-sm">
          <Link to="/marketplace" className="px-3 py-2 hover:bg-secondary transition-colors">Marketplace</Link>
          {authed ? (
            <>
              <Link to="/dashboard" className="px-3 py-2 hover:bg-secondary transition-colors">Dashboard</Link>
              {isAdmin && <Link to="/admin" className="px-3 py-2 hover:bg-secondary transition-colors text-primary font-medium">Admin</Link>}
              <button onClick={logout} className="px-3 py-2 hover:bg-secondary transition-colors">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 hover:bg-secondary transition-colors">Login</Link>
              <Link to="/signup" className="px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 transition-opacity">Join</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
