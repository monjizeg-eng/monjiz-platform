import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  const method = req.method;

  try {
    if (method === "GET") {
      const freelancerId = Array.isArray(req.query.freelancerId) ? req.query.freelancerId[0] : req.query.freelancerId;

      if (freelancerId) {
        const { data, error } = await supabase.from("client_requests").select("*").eq("freelancer_id", freelancerId).order("created_at", { ascending: false });
        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json(data);
      }

      return res.status(400).json({ error: "freelancerId required" });
    }

    if (method === "POST") {
      const body = req.body;
      const { data, error } = await supabase.from("client_requests").insert([body]).select();
      if (error) return res.status(400).json({ error: error.message });
      return res.status(201).json(data[0]);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}
