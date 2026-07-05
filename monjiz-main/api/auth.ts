import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default async function handler(req: any, res: any) {
  if (req.method === "POST") {
    const body = req.body;
    const action = body.action;

    try {
      if (action === "sign-up") {
        if (!supabaseServiceRoleKey) {
          return res.status(500).json({ error: "Missing Supabase service role key" });
        }

        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: body.email,
          password: body.password,
          email_confirm: true,
        });
        if (error) {
          if (error.message.toLowerCase().includes("already")) {
            const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
            if (listError) return res.status(400).json({ error: listError.message });

            const existingUser = users.users.find(
              (user) => user.email?.toLowerCase() === String(body.email).toLowerCase()
            );
            if (!existingUser) return res.status(400).json({ error: error.message });

            const { data: updated, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
              password: body.password,
              email_confirm: true,
            });
            if (updateError) return res.status(400).json({ error: updateError.message });
            return res.status(200).json(updated);
          }

          return res.status(400).json({ error: error.message });
        }
        return res.status(200).json(data);
      }

      if (action === "sign-in") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: body.email,
          password: body.password,
        });
        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json(data);
      }

      if (action === "sign-out") {
        const { error } = await supabase.auth.signOut();
        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json({ success: true });
      }

      if (action === "get-session") {
        const { data, error } = await supabase.auth.getSession();
        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json(data);
      }

      return res.status(400).json({ error: "Unknown action" });
    } catch (error) {
      return res.status(500).json({ error: String(error) });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
