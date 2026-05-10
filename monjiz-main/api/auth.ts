import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  if (req.method === "POST") {
    const body = req.body;
    const action = body.action;

    try {
      if (action === "sign-up") {
        const { data, error } = await supabase.auth.signUp({
          email: body.email,
          password: body.password,
        });
        if (error) return res.status(400).json({ error: error.message });
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
