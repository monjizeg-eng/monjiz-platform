import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  const method = req.method;

  try {
    if (method === "GET") {
      const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
      const freelancerId = Array.isArray(req.query.freelancerId) ? req.query.freelancerId[0] : req.query.freelancerId;

      if (id) {
        const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json(data);
      }

      if (freelancerId) {
        const { data, error } = await supabase.from("projects").select("*").eq("freelancer_id", freelancerId);
        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json(data);
      }

      const { data, error } = await supabase.from("projects").select("*");
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(data);
    }

    if (method === "POST") {
      const body = req.body;
      const { data, error } = await supabase.from("projects").insert([body]).select();
      if (error) return res.status(400).json({ error: error.message });
      return res.status(201).json(data[0]);
    }

    if (method === "PUT") {
      const body = req.body;
      const { id, ...updateData } = body;
      const { data, error } = await supabase.from("projects").update(updateData).eq("id", id).select();
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(data[0]);
    }

    if (method === "DELETE") {
      const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}
