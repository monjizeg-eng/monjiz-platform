import { useEffect, useState } from "react";
import { localDb } from "@/integrations/data/client";
import { Link } from "@tanstack/react-router";

/** Shown on the freelancer dashboard only when the signed-in user is an admin — never exposes credentials. */
export function AdminSetupHelper() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await localDb.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      const { data: roleData } = await localDb
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!roleData);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return null;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-4">Admin panel</h2>
      <div className="border border-green-500/20 bg-green-500/5 p-6 rounded">
        <div className="flex items-start gap-3">
          <div className="text-2xl">✓</div>
          <div>
            <p className="font-bold mb-1">Admin access</p>
            <p className="text-sm text-muted-foreground mb-4">Open the management dashboard to review freelancers and settings.</p>
            <Link
              to="/admin"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground text-sm hover:opacity-90 font-medium"
            >
              Go to admin panel →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
