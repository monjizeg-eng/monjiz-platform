import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const method = req.method;

  try {
    if (method === "GET") {
      const freelancerId = url.searchParams.get("freelancerId");

      if (freelancerId) {
        const { data, error } = await supabase.from("project_requests").select("*").eq("freelancer_id", freelancerId).order("created_at", { ascending: false });
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
        return new Response(JSON.stringify(data), { status: 200 });
      }

      return new Response(JSON.stringify({ error: "freelancerId required" }), { status: 400 });
    }

    if (method === "POST") {
      const body = await req.json();
      const { data, error } = await supabase.from("project_requests").insert([body]).select();
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      return new Response(JSON.stringify(data[0]), { status: 201 });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
}