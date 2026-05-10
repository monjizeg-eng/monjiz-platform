import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const method = req.method;

  try {
    if (method === "GET") {
      const id = url.searchParams.get("id");
      const userId = url.searchParams.get("userId");

      if (id) {
        const { data, error } = await supabase.from("freelancers").select("*").eq("id", id).single();
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
        return new Response(JSON.stringify(data), { status: 200 });
      }

      if (userId) {
        const { data, error } = await supabase.from("freelancers").select("*").eq("user_id", userId).single();
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
        return new Response(JSON.stringify(data), { status: 200 });
      }

      const { data, error } = await supabase.from("freelancers").select("*");
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      return new Response(JSON.stringify(data), { status: 200 });
    }

    if (method === "POST") {
      const body = await req.json();
      const { data, error } = await supabase.from("freelancers").insert([body]).select();
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      return new Response(JSON.stringify(data[0]), { status: 201 });
    }

    if (method === "PUT") {
      const body = await req.json();
      const { id, ...updateData } = body;
      const { data, error } = await supabase.from("freelancers").update(updateData).eq("id", id).select();
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      return new Response(JSON.stringify(data[0]), { status: 200 });
    }

    if (method === "DELETE") {
      const id = url.searchParams.get("id");
      const { error } = await supabase.from("freelancers").delete().eq("id", id);
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
}
