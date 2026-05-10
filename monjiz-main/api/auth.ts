import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: Request) {
  if (req.method === "POST") {
    const body = await req.json();
    const action = body.action;

    try {
      if (action === "sign-up") {
        const { data, error } = await supabase.auth.signUp({
          email: body.email,
          password: body.password,
        });
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
        return new Response(JSON.stringify(data), { status: 200 });
      }

      if (action === "sign-in") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: body.email,
          password: body.password,
        });
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
        return new Response(JSON.stringify(data), { status: 200 });
      }

      if (action === "sign-out") {
        const { error } = await supabase.auth.signOut();
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }

      if (action === "get-session") {
        const { data, error } = await supabase.auth.getSession();
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
        return new Response(JSON.stringify(data), { status: 200 });
      }

      return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400 });
    } catch (error) {
      return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
}
